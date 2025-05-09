import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User } from "@/types";
import { initializeTelegramApi } from "@/utils/telegramMock"; // Vẫn giữ phần khởi tạo API Telegram
import { getUser, saveUser } from "@/utils/storage";
import { toast } from "@/hooks/use-toast";
import {
  processDailyLogin,
//   refreshDailyTasksIfNeeded,
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

  useEffect(() => {
    // Initialize telegram API
    initializeTelegramApi();

    // Kiểm tra nếu user đã đăng nhập dựa vào session hoặc local storage
    const checkAuth = async () => {
      try {
        // Kiểm tra xem đã có session với backend chưa
        const profile = await userApi.getProfile();
        setUser(profile);

        // Xử lý daily login rewards
        try {
          const { isFirstLogin, tokensAwarded, currentStreak } =
            await processDailyLogin(); // Thêm await để đảm bảo xử lý đúng thứ tự

          if (isFirstLogin && tokensAwarded > 0) {
            toast({
              title: "Daily Login Reward!",
              description: `You received ${tokensAwarded} tokens for logging in today! Current streak: ${currentStreak} days.`,
            });
          }

        //   refreshDailyTasksIfNeeded();
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
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // Trong ứng dụng Telegram thực tế, lấy thông tin user từ Telegram.WebApp.initDataUnsafe
      // Hiện tại vẫn dùng mock để test
      const telegramWebApp = window.Telegram?.WebApp;

      // Nếu đang chạy trong môi trường Telegram thực tế
      if (
        telegramWebApp &&
        telegramWebApp.initDataUnsafe &&
        telegramWebApp.initDataUnsafe.user
      ) {
        const telegramUser = telegramWebApp.initDataUnsafe.user;

        // Gọi API đăng nhập/đăng ký
        const userData = await authApi.telegramLogin({
          id: telegramUser.id,
          username: telegramUser.username || `user${telegramUser.id}`,
          first_name: telegramUser.first_name,
          last_name: telegramUser.last_name,
          photo_url: telegramUser.photo_url,
        });

        // Lưu thông tin user
        setUser(userData);
        saveUser(userData); // Backup trong local storage
      } else {
        // Fallback cho development - sử dụng mock data
        console.warn("Using mock Telegram login for development");
        const mockTelegramLogin = (await import("@/utils/telegramMock"))
          .mockTelegramLogin;
        const loggedInUser = await mockTelegramLogin();

        // Gọi API đăng nhập/đăng ký với mock data
        try {
          const userData = await authApi.telegramLogin({
            id: parseInt(loggedInUser._id || ""),
            username: loggedInUser.username,
            photo_url: loggedInUser.avatar,
          });

          setUser(userData);
          saveUser(userData);
        } catch (apiErr) {
          console.error("API login failed, using mock user:", apiErr);
          setUser(loggedInUser);
          saveUser(loggedInUser);
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

    //   refreshDailyTasksIfNeeded();

      toast({
        title: "Login Successful",
        description: `Welcome back, ${user?.first_name}!`,
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

  const logout = async (): Promise<void> => {
    // Trong ứng dụng Telegram Mini App thực tế, không cần logout
    // Nhưng bạn vẫn nên xóa session phía backend
    setUser(null);

    toast({
      title: "Logged Out",
      description: "You have been logged out successfully.",
    });
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
