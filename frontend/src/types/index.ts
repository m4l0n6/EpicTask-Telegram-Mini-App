// Kiểu dữ liệu của người dùng
export interface User {
  id: string;
  username: string | null;
  avatarUrl: string | null;
  level: number;
  xp: number;
  tokens: number;
  badges: string[];
  completedTasks: number;
  dailyLoginStreak: number;
  lastDailyLogin: string | null;
  createdAt: string;
  lastLoginAt: string | null;
}

// Kiểu dữ liệu của nhiệm vụ
export interface Task {
  id: string;
  title: string;
  description: string;
  deadline: string | null;
  xpReward: number;
  tokenReward: number;
  completed: boolean;
  createdAt: string;
  completedAt: string | null;
  userId: string;
}

// Kiểu dữ liệu của huy hiệu
// Huy hiệu là một phần thưởng mà người dùng có thể nhận được khi hoàn thành nhiệm vụ hoặc đạt được một cột mốc nào đó trong ứng dụng.
export interface Badge {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  unlockedAt: string | null;
}

// Kiểu dữ liệu của bảng xếp hạng
export interface Leaderboard {
  userId: string;
  username: string | null;
  avatarUrl: string | null;
  xp: number;
  level: number;
  rank: number;
}

// Kiểu dữ liệu của thông báo
export interface Notification {
  id: string;
  type: 'deadline' | 'levelUp' | 'badge' | 'leaderboard' | 'token' | 'streak';
  message: string;
  read: boolean;
  createdAt: string;
}

// Kiểu dữ liệu của nhiệm vụ hàng ngày
export interface DailyTask {
  id: string;
  title: string;
  description: string;
  tokenReward: number;
  completed: boolean;
  type: 'login' | 'complete_task' | 'reach_streak';
  createdAt: string;
  updatedAt: string | null;
}

// Kiểu dữ liệu của vật phẩm trong cửa hàng
export interface StoreItem {
  id: string;
  title: string;
  description: string;
  price: number;
  type: 'badge' | 'token' | 'item';
  iconUrl: string;
  unlockedAt: string | null;
}

// Kiểu dữ liệu của lịch sử giao dịch
export interface PurchasedItem {
  id: string;
  userId: string;
  itemId: string;
  type: 'badge' | 'token' | 'item';
  price: number;
  purchasedAt: string;
  status: 'success' | 'failed';
}
