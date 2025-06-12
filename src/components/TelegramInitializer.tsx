import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { isRunningInTelegram } from "@/services/telegramService";

export const TelegramInitializer = () => {
  const { login } = useAuth();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initTelegram = async () => {
      if (isRunningInTelegram() && !initialized) {
        try {
          // Tự động đăng nhập khi chạy trong Telegram
          await login();
        } catch (error) {
          console.error("Error initializing Telegram:", error);
        } finally {
          setInitialized(true);
        }
      }
    };

    initTelegram();
  }, [login, initialized]);

  return null; // Component này không render gì cả
};
