import api from "./api";
import { User } from "@/types";
import { saveUser } from "@/utils/storage";

interface TelegramAuthData {
  id: number;
  auth_date: number;
  hash: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

export const initializeTelegram = (): void => {
  if (!window.Telegram) {
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-web-app.js";
    script.async = true;
    document.head.appendChild(script);
  }
};

export const authenticateTelegram = async (): Promise<User> => {
  try {
    if (!window.Telegram || !window.Telegram.WebApp) {
      throw new Error("Telegram WebApp is not initialized");
    }

    const initData = window.Telegram.WebApp.initData;

    if (!initData) {
      throw new Error("No Telegram init data available");
    }

    // Gọi API xác thực
    const response = await api.post("/auth/telegram", { initData });

    if (!response.data.user) {
      throw new Error("Authentication failed");
    }

    // Lưu thông tin user
    const userData = response.data.user;
    saveUser(userData);

    return userData;
  } catch (error) {
    console.error("Telegram authentication failed:", error);
    throw error;
  }
};

export const getTelegramUser = (): TelegramAuthData | null => {
  if (!window.Telegram?.WebApp?.initDataUnsafe) {
    return null;
  }

  const { user, auth_date, hash } = window.Telegram.WebApp.initDataUnsafe;

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    username: user.username,
    photo_url: user.photo_url,
    auth_date,
    hash,
  };
};

export const isRunningInTelegram = (): boolean => {
  // Thêm kiểm tra cho môi trường phát triển
  if (import.meta.env.DEV) {
    return false; // Luôn sử dụng mock trong môi trường phát triển
  }
  return !!window.Telegram && !!window.Telegram.WebApp;
};
