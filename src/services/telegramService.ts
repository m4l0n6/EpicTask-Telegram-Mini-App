import api from "./api";
import { User } from "@/types";
import { saveUser } from "@/utils/storage";

// Interface này đã được định nghĩa ở trong types/

/**
 * Khởi tạo Telegram WebApp
 * Trả về Promise khi quá trình khởi tạo hoàn tất
 */
export const initializeTelegram = (): Promise<unknown> => {
  // Telegram WebApp script được tự động tải khi ứng dụng chạy trong Telegram
  // Chúng ta chỉ cần đảm bảo đợi nó sẵn sàng
  return new Promise((resolve) => {
    if (window.Telegram && window.Telegram.WebApp) {
      resolve(window.Telegram.WebApp);
      return;
    }

    // Chỉ tải script khi đang phát triển và không có Telegram.WebApp
    if (import.meta.env.DEV) {
      const script = document.createElement("script");
      script.src = "https://telegram.org/js/telegram-web-app.js";
      script.async = true;
      script.onload = () => resolve(window.Telegram.WebApp);
      document.head.appendChild(script);
    }
  });
};

/**
 * Lấy toàn bộ initData cần thiết để gửi đến server
 */
export const getTelegramInitData = (): string | null => {
  if (!window.Telegram?.WebApp) {
    return null;
  }

  // Lấy initData string hoàn chỉnh được mã hóa
  const initData = window.Telegram.WebApp.initData;
  if (!initData) return null;

  return initData;
};

/**
 * Xác thực người dùng thông qua Telegram
 */
export const authenticateTelegram = async (): Promise<User> => {
  try {
    const initData = getTelegramInitData();

    if (!initData && import.meta.env.PROD) {
      throw new Error("Không thể lấy dữ liệu xác thực Telegram");
    }

    // Gửi initData string hoàn chỉnh để backend xác thực
    const response = await api.post("/auth/telegram", {
      initData: initData || "dev_mode", // Trong môi trường dev nếu không có dữ liệu thực
    });

    if (!response.data) {
      throw new Error("Xác thực thất bại");
    }

    // Lưu thông tin người dùng
    saveUser(response.data);

    return response.data;
  } catch (error) {
    console.error("Xác thực Telegram thất bại:", error);
    throw error;
  }
};

/**
 * Kiểm tra xem ứng dụng có đang chạy trong Telegram hay không
 */
export const isRunningInTelegram = (): boolean => {
  return !!window.Telegram?.WebApp;
};

/**
 * Lấy thông tin người dùng Telegram từ initDataUnsafe
 * Chỉ sử dụng cho hiển thị UI, không dùng để xác thực
 */
export const getTelegramUserInfo = (): {
  id?: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  photoUrl?: string;
} | null => {
  if (!window.Telegram?.WebApp?.initDataUnsafe?.user) {
    return null;
  }

  const { user } = window.Telegram.WebApp.initDataUnsafe;

  return {
    id: user.id,
    username: user.username,
    firstName: user.first_name,
    lastName: user.last_name,
    photoUrl: user.photo_url,
  };
};
