import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User } from "@/types";
import { initializeTelegramApi } from "@/utils/telegramMock"; 
import { saveUser, clearUser, clearAuthToken } from "@/utils/storage";
import { toast } from "@/hooks/use-toast";
import { authApi, userApi } from "@/services/api";
import { 
  isRunningInTelegram, 
  authenticateTelegram
} from "@/services/telegramService";

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
  const [isLoading, setIsLoading] = useState<boolean>(true);  useEffect(() => {
    // Trong môi trường dev, khởi tạo mock Telegram API
    if (import.meta.env.DEV && !isRunningInTelegram()) {
      initializeTelegramApi();
    }

    // Kiểm tra xác thực
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Kiểm tra xác thực hiện tại
  const checkAuth = async () => {
    try {
      // Kiểm tra session với backend
      const profile = await userApi.getProfile();
      
      // Bổ sung username từ thông tin Telegram nếu thiếu
      if (!profile.username && window.Telegram?.WebApp?.initDataUnsafe?.user) {
        const tgUser = window.Telegram.WebApp.initDataUnsafe.user;
        profile.username = tgUser.username || 
          `${tgUser.first_name || ''}${tgUser.last_name ? ' ' + tgUser.last_name : ''}`;
      }
      
      setUser(profile);
    } catch (error) {
      console.error("Authentication check failed:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const login = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Kiểm tra nếu đang chạy trong Telegram thực tế
      if (isRunningInTelegram()) {
        // Xác thực qua initData của Telegram
        const userData = await authenticateTelegram();
        setUser(userData);
        saveUser(userData);
        
        toast({
          title: "Login successful",
          description: "Welcome to EpicTask!",
        });
      } else {
        // Trong môi trường dev, sử dụng mock user
        console.log("Using mock Telegram user data for development");
        
        // Gọi API để đăng nhập với dữ liệu giả
        const telegramUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
        
        if (!telegramUser) {
          throw new Error("Not found Telegram user data in dev mode");
        }
        
        const userData = await authApi.telegramLogin({
          id: telegramUser.id,
          username: telegramUser.username || `user${telegramUser.id}`,
          first_name: telegramUser.first_name,
          last_name: telegramUser.last_name,
          photo_url: telegramUser.photo_url,
        });
        
        setUser(userData);
        saveUser(userData);
        
        toast({
          title: "Login successful (Dev Mode)",
          description: "Login as mock Telegram user",
        });
      }
    } catch (err) {
      console.error("Login error:", err);
      toast({
        title: "Failed to login in Telegram",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  const logout = () => {
    clearUser();
    clearAuthToken();
    setUser(null);
    
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully.",
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
