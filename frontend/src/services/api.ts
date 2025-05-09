import axios from 'axios';

// Lấy URL API từ biến môi trường hoặc mặc định
const API_BASE_URL = import.meta.env.VITE_API_URL;

console.log('Using API URL:', API_BASE_URL); 

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, 
  headers: {
    "Content-Type": "application/json",
  },
});

// Thêm interceptor để ghi log request URL (giúp debug)
api.interceptors.request.use(config => {
  console.log(`Making ${config.method?.toUpperCase()} request to: ${config.baseURL}${config.url}`);
  return config;
});

// Xử lý lỗi chung và refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const taskApi = {
  // Lấy tất cả task của người dùng hiện tại
  getTasks: async (filters?: { completed?: boolean }) => {
    const params = new URLSearchParams();
    if (filters?.completed !== undefined) {
      params.append("completed", String(filters.completed));
    }
    const response = await api.get(`/tasks?${params}`);
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
  telegramLogin: async (telegramData: {
    id: number;
    username: string;
    first_name?: string;
    last_name?: string;
    photo_url?: string;
  }) => {
    const response = await api.post("/auth/telegram", { user: telegramData });
    return response.data;
  },
};

// Các API liên quan đến người dùng
export const userApi = {
  // Lấy thông tin người dùng hiện tại
  getProfile: async () => {
    const response = await api.get("/users/me");
    console.log("User Profile:", response.data); // Log thông tin người dùng
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