import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
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
      } else {
        // Dự phòng sử dụng xác thực giả lập để kiểm tra
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
        } catch (apiErr) {
          console.error("API đăng nhập thất bại, sử dụng người dùng giả lập cục bộ:", apiErr);
          setUser(mockUser);
        }
      }
      
      // Xử lý daily login
      const { isFirstLogin, tokensAwarded, currentStreak } =
        await processDailyLogin();

      if (isFirstLogin && tokensAwarded > 0) {
        toast({
          title: "Daily Login Reward!",
          description: `You received ${tokensAwarded} tokens for logging in today! Current streak: ${currentStreak} days.`,
        });
      }

      // Thông báo đăng nhập thành công
      const displayName = user?.first_name || user?.username || "User";
      toast({
        title: "Login Successful",
        description: `Welcome back, ${displayName}!`,
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
    // Initialize telegram API
    const telegram = initializeTelegramApi();
    
    // Nếu đang chạy trong Telegram, mở rộng web app
    if (telegram?.WebApp) {
      try {
        telegram.WebApp.expand();
      } catch (err) {
        console.error("Error expanding Telegram WebApp:", err);
      }
    }

    // Kiểm tra nếu user đã đăng nhập dựa vào session hoặc local storage
    const checkAuth = async () => {
      try {
        // Kiểm tra xem đã có session với backend chưa
        const profile = await userApi.getProfile();
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
      } catch (err) {
        // Không có session hoặc session hết hạn
        // Kiểm tra local storage để fallback
        console.error("Session expired or not found, checking local storage:", err);
        const storedUser = getUser();
        if (storedUser) {
          setUser(storedUser);
          // Nếu có user trong local storage, thử login lại
          login().catch(e => console.error("Auto login failed:", e));
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
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
  }, [user]);

  useEffect(() => {
    // Tự động kích hoạt đăng nhập nếu chưa đăng nhập
    if (!user && !isLoading) {
      login();
    }
  }, [user, isLoading, login]);

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
