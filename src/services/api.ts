import axios from 'axios';
import { User } from '../types';

// Development mode helpers
const isDev = import.meta.env.DEV;
const useMockApiInDev = true; // Set to false if you want to use real API in dev

// Import shared constants
import { STORAGE_KEYS } from './constants';

// Initialize mock data for development mode
const initMockData = () => {
  // Create mock user if not exists
  if (!localStorage.getItem(STORAGE_KEYS.USER)) {
    const mockUser = {
      _id: "dev_user_id",
      username: "dev_user",
      telegramId: "123456789",
      xp: 100,
      level: 1,
      tokens: 20,
      avatar: "https://i.pravatar.cc/150?u=epicuser",
      badges: [],
      completedTasks: 0,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      dailyLoginStreak: 1
    };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mockUser));
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'mock_auth_token_' + Date.now());
  }
  
  // Create mock tasks if not exists
  if (!localStorage.getItem(STORAGE_KEYS.TASKS)) {
    const mockUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || '{}');
    const mockTasks = [
      {
        _id: "task_1",
        title: "Complete project demo",
        description: "Finish the presentation for next week",
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: null,
        xpReward: 50,
        tokenReward: 10,
        userId: mockUser._id,
        owner: mockUser.username
      },
      {
        _id: "task_2",
        title: "Study for exam",
        description: "Review chapters 5-8",
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        completed: false,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: null,
        xpReward: 30,
        tokenReward: 6,
        userId: mockUser._id,
        owner: mockUser.username
      }
    ];
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(mockTasks));
  }
};

// Initialize mock data right away in development mode
if (isDev && useMockApiInDev) {
  initMockData();
}



// Lấy URL API từ biến môi trường hoặc mặc định
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://epictask-backend.onrender.com/api/v1';

console.log('Using API URL:', isDev && useMockApiInDev ? 'MOCK API (Development Mode)' : API_BASE_URL);

// Create the API client
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
  const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  
  // Thêm header cho môi trường phát triển
  if (import.meta.env.DEV) {
    config.headers['X-Development-Mode'] = 'true';
  }
  
  return config;
});

// Xóa các interceptor request trùng lặp để tránh ghi đè header

// We'll use a simpler approach for authentication

// Xử lý lỗi chung và mock data for development mode
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle development mode with mock data
    if (import.meta.env.DEV && useMockApiInDev) {
      const originalRequest = error.config;
      console.log("Development mode: Using mock data for", originalRequest.url);
      
      // Get or create mock user
      let mockUser;
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
      
      if (storedUser) {
        mockUser = JSON.parse(storedUser);
      } else {
        // Initialize mock data if not already done
        initMockData();
        mockUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || '{}');
      }
      
      // Handle different request types
      if (originalRequest.url.includes('/auth/telegram')) {
        // Handle Telegram authentication
        return Promise.resolve({
          data: mockUser
        });
      } 
      
      if (originalRequest.url.includes('/tasks')) {
        if (originalRequest.method.toLowerCase() === 'get') {
          // Return tasks list
          const tasks = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || '[]');
          return Promise.resolve({
            data: tasks
          });
        }
        
        if (originalRequest.method.toLowerCase() === 'post' && !originalRequest.url.includes('/complete')) {
          // Handle task creation
          const tasks = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || '[]');
          const requestData = typeof originalRequest.data === 'string' 
            ? JSON.parse(originalRequest.data) 
            : originalRequest.data;
            
          const newTask = {
            _id: `task_${Date.now()}`,
            title: requestData.title,
            description: requestData.description || "",
            deadline: requestData.deadline || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            completed: false,
            createdAt: new Date().toISOString(),
            updatedAt: null,
            xpReward: requestData.xpReward || 10,
            tokenReward: Math.round((requestData.xpReward || 10) * 0.2),
            userId: mockUser._id,
            owner: mockUser.username
          };
          
          tasks.push(newTask);
          localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
          
          return Promise.resolve({
            data: newTask
          });
        }
          if (originalRequest.url.includes('/complete')) {
          // Handle task completion
          const taskId = originalRequest.url.split('/')[2];
          const tasks = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || '[]');
          const taskIndex = tasks.findIndex((t: { _id: string }) => t._id === taskId);
          
          if (taskIndex !== -1) {
            tasks[taskIndex].completed = true;
            tasks[taskIndex].updatedAt = new Date().toISOString();
            
            // Update user XP and tokens
            mockUser.xp += tasks[taskIndex].xpReward;
            mockUser.tokens += tasks[taskIndex].tokenReward;
            mockUser.completedTasks = (mockUser.completedTasks || 0) + 1;
            
            localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mockUser));
            
            return Promise.resolve({
              data: tasks[taskIndex]
            });
          }
        }
      }
      
      if (originalRequest.url.includes('/users/me')) {
        // Return user profile
        return Promise.resolve({
          data: mockUser
        });
      }
      
      // Default mock response
      return Promise.resolve({
        data: {}
      });
    }
      // For non-development mode or when not using mocks
    
    // If not a response error, just reject
    if (!error.response) {
      return Promise.reject(error);
    }
    
    // Handle 401 error (Unauthorized)
    if (error.response.status === 401 && !error.config._retry) {
      console.log("401 error, attempting to refresh authentication");
      
      error.config._retry = true; // Mark that we've attempted to retry
      
      try {
        // Clear existing tokens since they're not working
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        
        // Try to authenticate with Telegram in case session was lost
        const tg = window.Telegram?.WebApp;
        if (tg && tg.initData) {
          // Create auth data object with both initData and user info
          const authData = {
            initData: tg.initData,
            user: tg.initDataUnsafe?.user || {
              id: 12345678, // Fallback ID for development
              username: "dev_user"
            }
          };
          
          console.log("Making POST request to: https://epictask-backend.onrender.com/api/v1/auth/telegram");
          const authResponse = await api.post("/auth/telegram", authData);
          
          if (authResponse.data) {
            // Save user data 
            if (authResponse.data._id) {
              localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(authResponse.data));
            }
            
            // Save token if available
            if (authResponse.data.token) {
              localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, authResponse.data.token);
              
              // Update auth header and retry original request
              error.config.headers["Authorization"] = `Bearer ${authResponse.data.token}`;
              return api(error.config);
            }
          }
        } else if (isDev && useMockApiInDev) {
          // In development mode with mock API, regenerate a new mock token
          const mockToken = 'mock_auth_token_' + Date.now();
          localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, mockToken);
          error.config.headers["Authorization"] = `Bearer ${mockToken}`;
          return api(error.config);
        } else {
          console.error("No Telegram WebApp data available for reauthentication");
        }
      } catch (refreshError) {
        console.error("Failed to refresh authentication:", refreshError);
        
        // If in development mode with mock data, use mock data
        if (isDev && useMockApiInDev) {
          const mockToken = 'mock_auth_token_' + Date.now();
          localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, mockToken);
          error.config.headers["Authorization"] = `Bearer ${mockToken}`;
          return api(error.config);
        }
      }
    }
    
    // For other errors, just reject
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
    
    // Lưu token nếu có
    if (response.data) {
      // Save the user data
      if (response.data._id) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data));
      }
      
      // Save the token if available
      if (response.data.token) {
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.data.token);
      }
    }
    
    return response.data;
  },
    // Đăng xuất
  logout: async (): Promise<void> => {
    try {
      const response = await api.post("/auth/logout");
      
      // Xóa dữ liệu đã lưu trữ bất kể kết quả API
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      
      return response.data;
    } catch (error) {
      // Ngay cả khi API thất bại, vẫn nên dọn dẹp trạng thái cục bộ
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      throw error;
    }
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