import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
} from "react";
import { User } from "@/types";
import { initializeTelegramApi, mockTelegramLogin } from "@/utils/telegramMock";
import { getUser, saveUser } from "@/utils/storage";
import { toast } from "@/hooks/use-toast";
import {
  processDailyLogin,
} from "@/utils/gamification";
import { authApi, userApi } from "@/services/api";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const login = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Thử xác thực qua Telegram WebApp trước
      const telegramWebApp = window.Telegram?.WebApp;
      
      if (telegramWebApp?.initDataUnsafe?.user) {
        // Xác thực Telegram thật
        // Trong ứng dụng Telegram thực tế, lấy thông tin user từ Telegram.WebApp.initDataUnsafe
        const telegramUser = telegramWebApp.initDataUnsafe.user;

        try {
          // Gọi API đăng nhập/đăng ký với cả initData để backend xác thực
          const userData = await authApi.telegramLogin({
            initData: telegramWebApp.initData, // Thêm initData để backend xác thực với Telegram
            user: {
              id: telegramUser.id,
              username: telegramUser.username || `user${telegramUser.id}`,
              first_name: telegramUser.first_name,
              last_name: telegramUser.last_name,
              photo_url: telegramUser.photo_url,
            }
          });

          // Lưu thông tin user
          setUser(userData);
          saveUser(userData); // Backup trong local storage
        } catch (err) {
          // Chỉ sử dụng mock data trong môi trường phát triển
          if (import.meta.env.DEV) {
            console.error("API đăng nhập Telegram thất bại, sử dụng dữ liệu giả lập:", err);
            // Fallback to mock data in development
            const mockUser = await mockTelegramLogin();
            setUser(mockUser);
            saveUser(mockUser);
          } else {
            // Trong môi trường sản phẩm, hiển thị lỗi
            console.error("API đăng nhập Telegram thất bại:", err);
            throw err;
          }
        }
      } else {
        // Chỉ sử dụng mock data trong môi trường phát triển
        if (import.meta.env.DEV) {
          console.log("Dữ liệu Telegram không khả dụng, sử dụng xác thực giả lập");
          const mockUser = await mockTelegramLogin();
          
          try {
            // Thử xác thực với backend sử dụng dữ liệu giả lập
            const userData = await authApi.telegramLogin({
              initData: "mock_init_data",
              user: {
                id: parseInt(mockUser._id || "123456789"),
                username: mockUser.username || "test_user",
                first_name: "Test",
                last_name: "User", 
                photo_url: mockUser.avatar || "",
              }
            });
            
            setUser(userData);
            saveUser(userData);
          } catch (apiErr) {
            console.error("API đăng nhập thất bại, sử dụng người dùng giả lập cục bộ:", apiErr);
            setUser(mockUser);
            saveUser(mockUser);
          }
        } else {
          // Trong môi trường sản phẩm, hiển thị lỗi
          const error = new Error("Cannot authenticate with Telegram");
          console.error(error);
          throw error;
        }
      }
      
      // Xử lý daily login
      try {
        const { isFirstLogin, tokensAwarded } = await processDailyLogin();
        if (isFirstLogin && tokensAwarded > 0) {
          toast({
            title: "Daily Login Reward!",
            description: `You received ${tokensAwarded} tokens for logging in today!`,
          });
        }
      } catch (err) {
        console.error("Cannot hanlde daily login:", err);
      }

      // Thông báo đăng nhập thành công
      toast({
        title: "Login Successful",
        description: `Welcome back, ${user?.first_name || user?.username || "User"}!`, // Ưu tiên first_name
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to login";
      setError(errorMessage);
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    // Khởi tạo Telegram API chỉ nếu cần
    // Nếu trong Telegram, không cần khởi tạo mock
    const telegram = window.Telegram?.WebApp ? window.Telegram : initializeTelegramApi();
    
    // Biến flag để đảm bảo không gọi login nhiều lần
    let isMounted = true;
    
    // Nếu đang chạy trong Telegram, mở rộng web app
    if (telegram?.WebApp) {
      try {
        telegram.WebApp.expand();
        console.log("Expanded Telegram WebApp successfully");
      } catch (err) {
        console.error("Error expanding Telegram WebApp:", err);
      }
    }

    // Kiểm tra nếu user đã đăng nhập dựa vào session hoặc local storage
    const checkAuth = async () => {
      if (!isMounted) return;
      
      try {
        // Kiểm tra xem đã có session với backend chưa
        const profile = await userApi.getProfile();
        if (isMounted) {
          setUser(profile);
          
          // Xử lý daily login rewards
          try {
            const { isFirstLogin, tokensAwarded, currentStreak } =
              await processDailyLogin();

            if (isFirstLogin && tokensAwarded > 0) {
              toast({
                title: "Daily Login Reward!",
                description: `You received ${tokensAwarded} tokens for logging in today! Current streak: ${currentStreak} days.`,
              });
            }
          } catch (err) {
            console.error("Error processing daily login:", err);
          }
        }
      } catch (err) {
        // Không có session hoặc session hết hạn
        if (!isMounted) return;
        
        console.error("Session expired or not found, checking local storage:", err);
        const storedUser = getUser();
        if (storedUser) {
          setUser(storedUser);
          // Chỉ thực hiện login() nếu cần thiết và component vẫn mounted
          if (isMounted) {
            login().catch(e => console.error("Auto login failed:", e));
          }
        } else if (isMounted) {
          // Chỉ thực hiện login() nếu cần thiết và component vẫn mounted
          login().catch(e => console.error("Initial login failed:", e));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    checkAuth();
    
    // Cleanup function để tránh memory leaks và update states sau khi unmount
    return () => {
      isMounted = false;
    };
  }, [login]);

  // Thêm useEffect để lắng nghe sự kiện tokens_added từ socket hoặc qua event system
  useEffect(() => {
    const handleTokensAdded = (event: CustomEvent) => {
      // Thêm log để debug
      console.log("Tokens added event received:", event.detail?.amount);
      
      // Cập nhật user state với token mới
      if (user) {
        const amount = event.detail?.amount || 0;
        const newUser = {
          ...user,
          tokens: (user.tokens || 0) + amount
        };
        setUser(newUser);
        saveUser(newUser); // Lưu lại vào local storage để giữ dữ liệu nhất quán
        
        console.log("Tokens updated:", user.tokens, "->", (user.tokens || 0) + amount);
      }
    };

    // Đăng ký lắng nghe custom event
    document.addEventListener('tokensAdded', handleTokensAdded as EventListener);

    return () => {
      document.removeEventListener('tokensAdded', handleTokensAdded as EventListener);
    };
  }, [user]);  // Effect này tránh vòng lặp vô hạn bằng cách sử dụng ref
  const loginAttemptedRef = useRef(false);
  
  useEffect(() => {
    // Chỉ thực hiện đăng nhập tự động một lần khi component được mount
    // và khi user chưa đăng nhập và không đang loading
    if (!user && !isLoading && !loginAttemptedRef.current) {
      loginAttemptedRef.current = true;
      login().catch(e => console.error("Auto login attempt failed:", e));
    }
  }, [user, isLoading, login]);

  useEffect(() => {
    const telegram = window.Telegram?.WebApp;
    if (!telegram || !telegram.initData) {
      console.error("Telegram WebApp is not initialized or missing initData");
      return;
    }
  
    try {
      telegram.expand();
    } catch (err) {
      console.error("Error expanding Telegram WebApp:", err);
    }
  }, []);

  const logout = async (): Promise<void> => {
    try {
      // Gọi API logout nếu cần
      // await authApi.logout();
      
      // Xóa dữ liệu user
      setUser(null);
      localStorage.removeItem('user'); // Xóa user từ local storage

      toast({
        title: "Logged Out",
        description: "You have been logged out successfully.",
      });
    } catch (err) {
      console.error("Logout failed:", err);
      toast({
        title: "Logout Failed",
        description: "Failed to logout properly.",
        variant: "destructive",
      });
    }
  };

  const connectWebSocket = () => {
    const socket = new WebSocket("wss://epictask-backend.onrender.com");
    socket.onopen = () => console.log("WebSocket connected");
    socket.onclose = () => {
      console.log("WebSocket disconnected, retrying...");
      setTimeout(connectWebSocket, 5000); // Thử lại sau 5 giây
    };
  };
  connectWebSocket();

  return (
    <AuthContext.Provider value={{ user, isLoading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
