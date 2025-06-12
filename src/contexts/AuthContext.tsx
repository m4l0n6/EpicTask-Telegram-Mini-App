import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User } from "@/types";
import { initializeTelegramApi } from "@/utils/telegramMock"; 
import { getUser, saveUser } from "@/utils/storage";
import { toast } from "@/hooks/use-toast";
import { authApi, userApi } from "@/services/api";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Initialize telegram API
    initializeTelegramApi();

    // Kiểm tra nếu user đã đăng nhập dựa vào session hoặc local storage
    const checkAuth = async () => {
      try {
        // Kiểm tra xem đã có session với backend chưa
        const profile = await userApi.getProfile();
        setUser(profile);
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

        setUser(userData);
        saveUser(userData); // Lưu vào local storage để fallback
        toast({
          title: "Login successful!",
          description: "Welcome back Epic Task!",
        });
      } else {
        // Trong môi trường dev (không phải Telegram), sử dụng mock user
        console.log("Sử dụng mock Telegram user data");
        
        // Mock telegram user
        const mockTelegramUser = {
          id: 12345678,
          username: "testuser",
          first_name: "Test",
          last_name: "User",
          photo_url: "https://i.pravatar.cc/150?u=testuser",
        };

        const userData = await authApi.telegramLogin(mockTelegramUser);
        setUser(userData);
        saveUser(userData);
        toast({
          title: "Dev login successful",
          description: "Logged in with mock user data",
        });
      }
    } catch (err) {
      console.error("Login error:", err);
      toast({
        title: "Login failed",
        description: "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    // Xóa thông tin người dùng khỏi localStorage
    localStorage.removeItem("user");
    toast({
      title: "Logged out",
      description: "You have successfully logged out.",
    });
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
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
