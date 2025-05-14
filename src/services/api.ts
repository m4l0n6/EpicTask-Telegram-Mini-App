import axios from 'axios';
import { User } from '../types';

// Lấy URL API từ biến môi trường hoặc mặc định
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://epictask-backend.onrender.com/api/v1';

console.log('Using API URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Thêm interceptor để ghi log request URL và thêm header xác thực
api.interceptors.request.use(config => {
  console.log(`Making ${config.method?.toUpperCase()} request to: ${config.baseURL}${config.url}`);
  
  // Thêm dữ liệu Telegram vào header nếu có
  const tg = window.Telegram?.WebApp;
  if (tg && tg.initData) {
    config.headers['Telegram-Data'] = tg.initData;
  }
  
  // Thêm token xác thực
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  
  // Trong môi trường phát triển, thêm header để backend có thể nhận diện
  if (import.meta.env.DEV) {
    config.headers['X-Development-Mode'] = 'true';
  }
  
  return config;
});

// Xóa các interceptor request trùng lặp để tránh ghi đè header

// Thêm biến trạng thái để theo dõi quá trình xác thực
const authState = {
  isAuthenticating: false,
  authRetryCount: 0,
  maxRetries: 2
};

// Xử lý lỗi chung và refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Nếu không phải lỗi response, throw luôn
    if (!error.response) {
      return Promise.reject(error);
    }
    
    const originalRequest = error.config;
    
    // Kiểm tra nếu lỗi 401 và chưa thử refresh
    if (error.response.status === 401 && !originalRequest._retry) {
      // Ngăn nhiều request cùng thử refresh token
      if (authState.isAuthenticating) {
        // Đợi quá trình xác thực hiện tại hoàn thành
        await new Promise(resolve => {
          const checkAuth = () => {
            if (!authState.isAuthenticating) {
              resolve(true);
            } else {
              setTimeout(checkAuth, 200);
            }
          };
          checkAuth();
        });
        
        // Nếu đã xác thực thành công, thử lại request
        const token = localStorage.getItem("authToken");
        if (token) {
          originalRequest.headers["Authorization"] = `Bearer ${token}`;
          return api(originalRequest);
        }
      }
      
      // Giới hạn số lần thử lại
      if (authState.authRetryCount >= authState.maxRetries) {
        console.log("Đã vượt quá số lần thử lại xác thực tối đa");
        
        // Reset trạng thái
        authState.authRetryCount = 0;
        authState.isAuthenticating = false;
        
        // Xóa token cũ
        localStorage.removeItem("authToken");
        localStorage.removeItem("refreshToken");
        
        console.log("Session expired, redirecting to login page");
        return Promise.reject(error);
      }
      
      // Đánh dấu đang thực hiện xác thực
      authState.isAuthenticating = true;
      authState.authRetryCount++;
      originalRequest._retry = true;

      console.log("Đang thử lấy lại token xác thực từ Telegram...");
      
      try {
        // Lấy dữ liệu Telegram
        const tg = window.Telegram?.WebApp;
        if (!tg || !tg.initData) {
          throw new Error("Không có dữ liệu Telegram WebApp");
        }
        
        // Gọi API xác thực Telegram để lấy token mới
        const response = await api.post("/auth/telegram", { 
          initData: tg.initData 
        });
        
        if (response.data && response.data.token) {
          // Lưu token mới
          localStorage.setItem("authToken", response.data.token);
          if (response.data.refreshToken) {
            localStorage.setItem("refreshToken", response.data.refreshToken);
          }
          
          // Cập nhật header cho request hiện tại
          originalRequest.headers["Authorization"] = `Bearer ${response.data.token}`;
          
          console.log("Đã làm mới token thành công");
          
          // Reset trạng thái xác thực
          authState.isAuthenticating = false;
          
          // Thử lại request gốc
          return api(originalRequest);
        } else {
          throw new Error("Không nhận được token mới");
        }
      } catch (refreshError) {
        console.error("Không thể làm mới token:", refreshError);
        
        // Reset trạng thái
        authState.isAuthenticating = false;
        
        // Nếu quá số lần thử, xóa token
        if (authState.authRetryCount >= authState.maxRetries) {
          localStorage.removeItem("authToken");
          localStorage.removeItem("refreshToken");
          console.log("Xóa token cũ do không thể làm mới");
        }
        
        return Promise.reject(error);
      }
    }
    
    // Các lỗi khác không phải 401 hoặc đã thử refresh
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

interface TelegramAuthData {
  initData: string;
  user: {
    id: number;
    username: string;
    first_name?: string;
    last_name?: string;
    photo_url?: string;
  };
}

export const taskApi = {
  // Lấy tất cả task của người dùng hiện tại
  getTasks: async (filters?: { completed?: boolean }) => {
    const params = new URLSearchParams();
    if (filters?.completed !== undefined) {
      params.append("completed", String(filters.completed));
    }
    const response = await api.get(`/tasks${params}`);
    return response.data;
  },

  // Lấy task theo ID
  getTaskById: async (taskId: string) => {
    const response = await api.get(`/tasks/${taskId}`);
    return response.data;
  },

  // Tạo task mới
  createTask: async (taskData: {
    title: string;
    description?: string;
    deadline?: string;
    xpReward?: number;
  }) => {
    const response = await api.post("/tasks", taskData);
    return response.data;
  },

  // Cập nhật task hiện có
  updateTask: async (
    _id: string,
    taskData: {
      title?: string;
      description?: string;
      deadline?: string;
    }
  ) => {
    const response = await api.patch(`/tasks/${_id}`, taskData);
    return response.data;
  },

  // Xóa task
  deleteTask: async (_id: string) => {
    const response = await api.delete(`/tasks/${_id}`);
    return response.data;
  },

  // Hoàn thành task
  completeTask: async (taskId: string) => {
    const response = await api.post(`/tasks/${taskId}/complete`);
    console.log("API Response:", response.data); // Log để kiểm tra response
    return response.data;
  },
};

export const authApi = {
  // Đăng nhập qua Telegram
  telegramLogin: async (data: TelegramAuthData): Promise<User> => {
    const response = await api.post("/auth/telegram", data);
    return response.data;
  },
  
  // Đăng xuất
  logout: async (): Promise<void> => {
    const response = await api.post("/auth/logout");
    return response.data;
  },

  // Lấy thông tin profile
  getProfile: async (): Promise<User> => {
    const response = await api.get("/users/me");
    return response.data;
  },
};

export const userApi = {
  // Lấy thông tin profile
  getProfile: async (): Promise<User> => {
    const response = await api.get("/users/me");
    return response.data;
  },
  
  // Cập nhật thông tin profile
  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await api.patch("/users/me", data);
    return response.data;
  },

  addXp: async (amount: number) => {
    const response = await api.post("/users/xp", { amount });
    return response.data;
  },

  addTokens: async (amount: number) => {
    const response = await api.post("/users/tokens", { amount });
    return response.data;
  },

  addNotification: async (notification: Notification) => {
    const response = await api.post("/users/notifications", notification);
    return response.data;
  },

  processDailyLogin: async (): Promise<{
    isFirstLogin: boolean;
    tokensAwarded: number;
    currentStreak: number;
  }> => {
    const response = await api.post("/auth/daily-login");
    return response.data;
  },
};

// Các API liên quan đến bảng xếp hạng
export const leaderboardApi = {
  getLeaderboard: async () => {
    const response = await api.get(`/leaderboard`);
    return response.data;
  },
};

// Các API liên quan đến huy hiệu
export const badgeApi = {
  getAllBadges: async () => {
    const response = await api.get("/badges");
    return response.data;
  },
  
  getUserBadges: async () => {
    // API trả về thông tin user, bao gồm mảng badges
    const response = await api.get("/users/me");
    // Dựa vào userController.js, badges được trả về trong trường badges
    return response.data.badges || [];
  }
};

export default api;