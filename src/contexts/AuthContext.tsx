import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
  useCallback,
} from "react";
import { User } from "@/types";
import { initializeTelegramApi } from "@/utils/telegramMock";
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
  const login = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // Thử xác thực qua Telegram WebApp
      const telegramWebApp = window.Telegram?.WebApp;
      
      if (telegramWebApp?.initDataUnsafe?.user) {
        try {
          // Gọi API đăng nhập với dữ liệu Telegram
          const userData = await authApi.telegramLogin({
            initData: telegramWebApp.initData,
            user: {
              id: telegramWebApp.initDataUnsafe.user.id,
              username: telegramWebApp.initDataUnsafe.user.username || `user${telegramWebApp.initDataUnsafe.user.id}`,
              first_name: telegramWebApp.initDataUnsafe.user.first_name,
              last_name: telegramWebApp.initDataUnsafe.user.last_name,
              photo_url: telegramWebApp.initDataUnsafe.user.photo_url,
            }
          });
          
          setUser(userData);
          saveUser(userData);
        } catch (err) {
          console.error("API đăng nhập Telegram thất bại:", err);
          
          // Trong môi trường phát triển, dùng dữ liệu giả lập
          if (import.meta.env.DEV) {
            console.log("DEV mode: Using mock user data");
            const storedUser = getUser();
            if (storedUser) {
              setUser(storedUser);
            } else {
              // Tạo user giả với đầy đủ thuộc tính
              const mockUser = {
                _id: "dev_user_id",
                username: "dev_user",
                telegramId: "123456789",
                xp: 100,
                level: 1,
                tokens: 20,
                avatar: "https://via.placeholder.com/150",
                badges: [],
                completedTasks: 0,
                createdAt: new Date().toISOString(),
                lastLoginAt: new Date().toISOString(),
              };
              setUser(mockUser);
              saveUser(mockUser);
            }
          } else {
            throw err;
          }
        }
      } else if (import.meta.env.DEV) {
        // Trong môi trường phát triển mà không có Telegram WebApp
        console.log("DEV mode without Telegram data: Using mock user");
        const storedUser = getUser();
        if (storedUser) {
          setUser(storedUser);
        } else {
          // Tạo user giả với đầy đủ thuộc tính
          const mockUser = {
            _id: "dev_user_id",
            username: "dev_user",
            telegramId: "123456789",
            xp: 100,
            level: 1,
            tokens: 20,
            avatar: "https://via.placeholder.com/150",
            badges: [],
            completedTasks: 0,
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
          };
          setUser(mockUser);
          saveUser(mockUser);
        }
      } else {
        throw new Error("Telegram WebApp data not available");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Authentication failed.");
    } finally {
      setIsLoading(false);
    }
  }, []);
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
    if (!user && !isLoading && !loginAttemptedRef.current) {
      loginAttemptedRef.current = true;
      login().catch((e) => console.error("Auto login attempt failed:", e));
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

  // Định nghĩa ref cho biến theo dõi số lần kết nối lại và websocket
  const retryCountRef = useRef(0);
  const websocketRef = useRef<WebSocket | null>(null);

  const connectWebSocket = () => {
    // Không kết nối WebSocket trong môi trường phát triển
    if (import.meta.env.DEV && !import.meta.env.VITE_ENABLE_WEBSOCKET) {
      console.log("WebSocket disabled in development mode");
      return;
    }
    
    try {
      const socket = new WebSocket("wss://epictask-backend.onrender.com");
      
      socket.onopen = () => {
        console.log("WebSocket connected");
        websocketRef.current = socket;
      };
      
      socket.onclose = () => {
        console.log("WebSocket disconnected");
        websocketRef.current = null;
        
        // Giới hạn số lần thử kết nối lại
        if (retryCountRef.current < 3) {
          console.log(`Retrying WebSocket connection (${retryCountRef.current + 1}/3)...`);
          retryCountRef.current++;
          setTimeout(connectWebSocket, 5000); // Thử lại sau 5 giây
        } else {
          console.log("Max WebSocket retry attempts reached");
        }
      };
      
      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
    }
  };

  connectWebSocket();

  useEffect(() => {
    if (user) {
      const socket = new WebSocket("wss://epictask-backend.onrender.com");
      socket.onopen = () => {
        console.log("WebSocket connected");
        socket.send(JSON.stringify({ type: "authenticate", userId: user._id }));
      };
      socket.onclose = () => console.log("WebSocket disconnected");
      return () => socket.close();
    }
  }, [user]);

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
