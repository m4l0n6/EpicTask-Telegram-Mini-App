import { Badge } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { getUser, saveUser } from "./storage";

export const XP_PER_LEVEL = 100; // Số điểm kinh nghiệm cần để lên cấp
export const MAX_LEVEL = 50; // Cấp độ tối đa

export const LOGIN_TOKEN_REWARD = 5; // Phần thưởng đăng nhập hàng ngày
export const STREAK_BONUS_MULTIPLIER = 0.2; // Hệ số thưởng cho chuỗi đăng nhập liên tiếp

export const calculateLevel = (xp: number): number => {
  return Math.min(Math.floor(xp / XP_PER_LEVEL) + 1, MAX_LEVEL);
};

interface DailyLoginResult {
  isFirstLogin: boolean;
  tokensAwarded: number;
  currentStreak: number;
}

// định nghĩa các huy hiệu mặc định
export const initializeDefaultBadges = (): Badge[] => {
  const defaultBadges: Badge[] = [
    {
      id: uuidv4(),
      name: "First Task",
      description: "Complete your first task",
      iconUrl: "🏆",
      unlockedAt: null,
    },
    {
      id: uuidv4(),
      name: "Taskmaster",
      description: "Complete 10 tasks",
      iconUrl: "🎯",
      unlockedAt: null,
    },
    {
      id: uuidv4(),
      name: "Task Enthusiast",
      description: "Complete 25 tasks",
      iconUrl: "⚡",
      unlockedAt: null,
    },
    {
      id: uuidv4(),
      name: "Task Wizard",
      description: "Complete 50 tasks",
      iconUrl: "🧙",
      unlockedAt: null,
    },
    {
      id: uuidv4(),
      name: "Task Legend",
      description: "Complete 100 tasks",
      iconUrl: "👑",
      unlockedAt: null,
    },
    {
      id: uuidv4(),
      name: "Apprentice",
      description: "Reach level 5",
      iconUrl: "🌱",
      unlockedAt: null,
    },
    {
      id: uuidv4(),
      name: "Expert",
      description: "Reach level 10",
      iconUrl: "🌟",
      unlockedAt: null,
    },
    {
      id: uuidv4(),
      name: "Master",
      description: "Reach level 20",
      iconUrl: "🔥",
      unlockedAt: null,
    },
    {
      id: uuidv4(),
      name: "Grandmaster",
      description: "Reach level 30",
      iconUrl: "💎",
      unlockedAt: null,
    },
    {
      id: uuidv4(),
      name: "Legendary",
      description: "Reach level 50",
      iconUrl: "🏅",
      unlockedAt: null,
    },
  ];

  return defaultBadges;
};

export const processDailyLogin = (): DailyLoginResult => {
  const user = getUser();
  if (!user) {
    return { isFirstLogin: false, tokensAwarded: 0, currentStreak: 0 };
  }

  const now = new Date();
  const today = now.toISOString().split("T")[0]; // YYYY-MM-DD

  // Không có login hôm nay
  if (!user.lastDailyLogin || user.lastDailyLogin !== today) {
    const isFirstLogin = true;
    const tokensAwarded = 10; // Base award
    const streakBonus = user.dailyLoginStreak
      ? Math.min(user.dailyLoginStreak, 5)
      : 0;
    const totalTokens = tokensAwarded + streakBonus;

    // Kiểm tra xem có phải ngày liên tiếp không
    let newStreak = 1;
    if (user.lastDailyLogin) {
      const lastLogin = new Date(user.lastDailyLogin);
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);

      if (
        lastLogin.toISOString().split("T")[0] ===
        yesterday.toISOString().split("T")[0]
      ) {
        newStreak = (user.dailyLoginStreak || 0) + 1;
      }
    }

    // Cập nhật user
    user.tokens = (user.tokens || 0) + totalTokens;
    user.lastDailyLogin = today;
    user.dailyLoginStreak = newStreak;

    saveUser(user);

    return {
      isFirstLogin,
      tokensAwarded: totalTokens,
      currentStreak: newStreak,
    };
  }

  // Đã login hôm nay rồi
  return {
    isFirstLogin: false,
    tokensAwarded: 0,
    currentStreak: user.dailyLoginStreak || 0,
  };
};

// export const refreshDailyTasksIfNeeded = (): void => {
//   const tasks = getDailyTasks();
  
//   // If no tasks or all tasks expired, generate new ones
//   const now = new Date().toISOString();
//   const needsRefresh = tasks.length === 0 || 
//     tasks.every(task => task.expiresAt < now || task.completed);
  
//   if (needsRefresh) {
//     generateDailyTasks();
//     return true;
//   }
  
//   return false;
// }

