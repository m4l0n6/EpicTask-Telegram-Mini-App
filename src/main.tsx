import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { isRunningInTelegram, initializeTelegram } from "@/services/telegramService";

// Khởi tạo Telegram và kiểm tra nếu đang chạy trong Telegram
const initApp = async () => {
  await initializeTelegram();
  const isTelegram = isRunningInTelegram();
  
  // Thiết lập cấu hình cho Telegram Mini App nếu cần thiết
  if (isTelegram && window.Telegram?.WebApp) {
    // Cho phép Telegram WebApp mở rộng toàn màn hình
    window.Telegram.WebApp.expand();
    
    // Thiết lập theme phù hợp với Telegram
    document.documentElement.classList.add(
      window.Telegram.WebApp.colorScheme === 'dark' ? 'dark' : 'light'
    );
    
    // Tạo một hàm kiểm tra theme định kỳ
    const checkColorScheme = () => {
      const currentTheme = window.Telegram.WebApp.colorScheme;
      document.documentElement.classList.remove('dark', 'light');
      document.documentElement.classList.add(
        currentTheme === 'dark' ? 'dark' : 'light'
      );
    };
    
    // Gọi lần đầu và thiết lập interval để kiểm tra thay đổi
    checkColorScheme();
    setInterval(checkColorScheme, 1000);
  }

  // Render ứng dụng
  createRoot(document.getElementById('root')!).render(
    <App/>
  );
};

// Khởi động ứng dụng
initApp();
