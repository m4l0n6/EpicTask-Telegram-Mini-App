// Kiểu dữ liệu của người dùng
export interface Task {
  id: string;
  title: string;
  description: string;
  deadline: string | null; // ISO format string or null
  completed: boolean;
  createdAt: string; // ISO format string
  xpReward: number;
  tokenReward: number;
}

// Thêm các interface khác cho ứng dụng của bạn nếu cần
export interface User {
  level: number;
  xp: number;
  tokens: number;
  streak: number;
  lastLogin: string | null;
  badges: string[];
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
