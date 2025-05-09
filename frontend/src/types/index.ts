// Kiểu dữ liệu của người dùng
export interface Task {
  _id?: string;
  title: string;
  description: string;
  deadline: string | null; // ISO format string or null
  completed: boolean;
  createdAt: string; // ISO format string
  updatedAt: string | null; // ISO format string or null
  xpReward: number;
  tokenReward: number;
  userId: string;
  owner: string;
}

// Thêm các interface khác cho ứng dụng của bạn nếu cần
export interface User {
  _id?: string;
  telegramId?: number | string;
  username: string;
  avatar?: string;
  first_name?: string;
  last_name?: string;
  tokens: number;
  xp: number;
  level: number;
  badges: Badge[];
  completedTasks: number;
  lastDailyLogin?: string | null;
  dailyLoginStreak?: number;
  lastTaskRefresh?: string | null;
  createdAt: string;
  updatedAt?: string;
  lastLoginAt: string;
}

// Kiểu dữ liệu của huy hiệu
// Huy hiệu là một phần thưởng mà người dùng có thể nhận được khi hoàn thành nhiệm vụ hoặc đạt được một cột mốc nào đó trong ứng dụng.

export interface Badge {
  _id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
  // Thêm các trường này
  milestoneType?: "tasksCompleted" | "levelReached" | string;
  milestoneValue?: number;
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
  type: string;
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
  type: "login" | "complete_task" | "reach_streak";
  requirement: number;
  progress: number;
  createdAt: string;
  completedAt: string | null;
  expiresAt: string;
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
