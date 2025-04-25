import {
  User,
  Task,
  Badge,
  Notification as AppNotification,
  DailyTask,
} from "@/types";
import { v4 as uuidv4 } from "uuid";
import {
  getUser,
  saveUser,
  addNotification,
  unlockBadge,
  getBadges,
  saveDailyTasks,
  getDailyTasks,
} from "./storage";
import { userApi } from "@/services/api";
import { taskApi } from "@/services/api";
import { addDays, isSameDay, startOfDay } from "date-fns";

// Đinh nghĩa các hằng số cho XP và cấp độ
export const XP_PER_LEVEL = 100;
export const MAX_LEVEL = 50;

// Định nghĩa các hằng số cho phần thưởng
export const LOGIN_TOKEN_REWARD = 5;
export const STREAK_BONUS_MULTIPLIER = 0.2; // Phần thưởng cho mỗi ngày liên tiếp đăng nhập

// Tính toán cấp độ
export const calculateLevel = (xp: number): number => {
  return Math.min(Math.floor(xp / XP_PER_LEVEL) + 1, MAX_LEVEL);
};

// TÍnh toán cấp độ cần thiết
export const xpForNextLevel = (level: number): number => {
  return level * XP_PER_LEVEL;
};

// Calculate XP progress percentage towards next level
export const calculateXpProgress = (user: User): number => {
  const currentLevelXp = (user.level - 1) * XP_PER_LEVEL;
  const nextLevelXp = user.level * XP_PER_LEVEL;
  const xpInCurrentLevel = user.xp - currentLevelXp;
  const xpNeededForNextLevel = nextLevelXp - currentLevelXp;

  return Math.floor((xpInCurrentLevel / xpNeededForNextLevel) * 100);
};

// Tăng xp và xử lý tăng cấp cho người dùng
export const addXpToUser = async (
  xpAmount: number
): Promise<{ user: User; leveledUp: boolean; newLevel?: number }> => {
  try {
    // Thay vì lấy user từ local storage, lấy từ API
    const user = await userApi.getProfile();

    const oldLevel = user.level;
    // Gọi API để thêm XP
    const updatedUser = await userApi.addXp(xpAmount);
    const newLevel = updatedUser.level;

    const leveledUp = newLevel > oldLevel;

    // Nếu người dùng lên cấp sẽ nhận thông báo
    if (leveledUp) {
      // const notification: AppNotification = {
      //   id: uuidv4(), // Có thể server sẽ tạo ID
      //   type: "levelUp",
      //   message: `Congratulations! You've reached level ${newLevel}!`,
      //   read: false,
      //   createdAt: new Date().toISOString(),
      // };

      // // Thay bằng API call để tạo thông báo
      // await userApi.addNotification(notification as any);

      // Check for badge unlocks based on level
      await checkAndUnlockLevelBadges(newLevel);
    }

    return {
      user: updatedUser,
      leveledUp,
      newLevel: leveledUp ? newLevel : undefined,
    };
  } catch (error) {
    console.error("Error adding XP to user:", error);
    throw error;
  }
};

// Tăng tokens cho người dùng
export const addTokensToUser = async (
  tokenAmount: number
): Promise<{ user: User; newTokens: number }> => {
  try {
    // Gọi API để thêm tokens
    const updatedUser = await userApi.addTokens(tokenAmount);

    // // Tạo thông báo cho việc nhận token qua API
    // const notification: AppNotification = {
    //   id: uuidv4(),
    //   type: "token",
    //   message: `You've earned ${tokenAmount} tokens!`,
    //   read: false,
    //   createdAt: new Date().toISOString(),
    // };

    // await userApi.addNotification(notification as any);

    return { user: updatedUser, newTokens: tokenAmount };
  } catch (error) {
    console.error("Error adding tokens to user:", error);
    throw error;
  }
};

// Hoàn thành 1 nhiệm vụ và nhận XP
export const completeTask = async (
  taskId: string
): Promise<{
  task: Task;
  xpGained: number;
  tokenGained: number;
  leveledUp: boolean;
}> => {
  try {
    // Gọi API để hoàn thành nhiệm vụ
    // API nên trả về tất cả thông tin cần thiết trong một request duy nhất
    const response = await taskApi.completeTask(taskId);

    // API trả về task đã cập nhật, số XP, token nhận được, và trạng thái lên cấp
    const { task, xpGained, tokenGained, leveledUp } = response;

    // Cập nhật tiến độ nhiệm vụ hàng ngày
    await updateDailyTaskProgress("complete_task", 1);

    return { task, xpGained, tokenGained, leveledUp };
  } catch (error) {
    console.error("Error completing task:", error);
    throw error;
  }
};

// Check and unlock badges based on level
export const checkAndUnlockLevelBadges = (level: number): Badge[] => {
  const badges = getBadges();
  const unlockedBadges: Badge[] = [];

  // Define level badges to check
  const levelBadges = [
    { level: 5, badgeName: "Apprentice" },
    { level: 10, badgeName: "Expert" },
    { level: 20, badgeName: "Master" },
    { level: 30, badgeName: "Grandmaster" },
    { level: 50, badgeName: "Legendary" },
  ];

  for (const levelBadge of levelBadges) {
    if (level >= levelBadge.level) {
      const badge = badges.find(
        (b) => b.name === levelBadge.badgeName && !b.unlockedAt
      );
      if (badge) {
        const unlockedBadge = unlockBadge(badge.id);
        if (unlockedBadge) {
          unlockedBadges.push(unlockedBadge);

          // Create notification for badge unlock
          const notification: AppNotification = {
            id: uuidv4(),
            type: "badge",
            message: `You've unlocked the "${unlockedBadge.name}" badge!`,
            read: false,
            createdAt: new Date().toISOString(),
          };
          addNotification(notification);
        }
      }
    }
  }

  return unlockedBadges;
};

// Check and unlock badges based on task completion count
export const checkAndUnlockTaskBadges = (completedTasks: number): Badge[] => {
  const badges = getBadges();
  const unlockedBadges: Badge[] = [];

  // Define task completion badges
  const taskBadges = [
    { tasks: 1, badgeName: "First Task" },
    { tasks: 10, badgeName: "Taskmaster" },
    { tasks: 25, badgeName: "Task Enthusiast" },
    { tasks: 50, badgeName: "Task Wizard" },
    { tasks: 100, badgeName: "Task Legend" },
  ];

  for (const taskBadge of taskBadges) {
    if (completedTasks >= taskBadge.tasks) {
      const badge = badges.find(
        (b) => b.name === taskBadge.badgeName && !b.unlockedAt
      );
      if (badge) {
        const unlockedBadge = unlockBadge(badge.id);
        if (unlockedBadge) {
          unlockedBadges.push(unlockedBadge);

          // Create notification for badge unlock
          const notification: AppNotification = {
            id: uuidv4(),
            type: "badge",
            message: `You've unlocked the "${unlockedBadge.name}" badge!`,
            read: false,
            createdAt: new Date().toISOString(),
          };
          addNotification(notification);
        }
      }
    }
  }

  return unlockedBadges;
};

// Initialize default badges
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

// Generate leaderboard
export const generateLeaderboard = (users: User[]) => {
  return users
    .slice()
    .sort((a, b) => b.xp - a.xp)
    .map((user, index) => ({
      userId: user._id,
      username: user.username,
      avatarUrl: user.avatar,
      xp: user.xp,
      level: user.level,
      rank: index + 1,
    }));
};

// Check if the user has logged in today and process daily login rewards
export const processDailyLogin = (): {
  isFirstLogin: boolean;
  tokensAwarded: number;
  currentStreak: number;
} => {
  const user = getUser();
  if (!user) {
    throw new Error("User not found");
  }

  const now = new Date();
  const today = startOfDay(now).toISOString();
  const lastLogin = user.lastDailyLogin ? new Date(user.lastDailyLogin) : null;

  // Check if this is first login of the day
  const isFirstLogin = !lastLogin || !isSameDay(lastLogin, now);

  if (isFirstLogin) {
    // Check if we need to reset or increment streak
    let newStreak = 1;
    if (lastLogin) {
      const yesterday = startOfDay(addDays(now, -1));
      if (isSameDay(lastLogin, yesterday)) {
        // Consecutive day login
        newStreak = (user.dailyLoginStreak || 0) + 1;
      }
    }

    // Calculate tokens to award
    const streakBonus = Math.floor(
      LOGIN_TOKEN_REWARD * STREAK_BONUS_MULTIPLIER * (newStreak - 1)
    );
    const tokensAwarded = LOGIN_TOKEN_REWARD + streakBonus;

    // Update user data
    user.lastDailyLogin = today;
    user.dailyLoginStreak = newStreak;
    addTokensToUser(tokensAwarded);

    // Create streak notification if streak is growing
    if (newStreak > 1) {
      const notification: AppNotification = {
        id: uuidv4(),
        type: "streak",
        message: `You're on a ${newStreak} day login streak! Keep it up!`,
        read: false,
        createdAt: new Date().toISOString(),
      };
      addNotification(notification);
    }

    // Update daily task progress for login type
    updateDailyTaskProgress("login", 1);

    // Update streak-based tasks
    updateDailyTaskProgress("reach_streak", newStreak);

    saveUser(user);

    return {
      isFirstLogin: true,
      tokensAwarded,
      currentStreak: newStreak,
    };
  }

  return {
    isFirstLogin: false,
    tokensAwarded: 0,
    currentStreak: user.dailyLoginStreak || 0,
  };
};

// Generate daily tasks for the user
export const generateDailyTasks = (): DailyTask[] => {
  const now = new Date();
  const tomorrow = addDays(now, 1);
  tomorrow.setHours(0, 0, 0, 0); // Set to start of the next day

  const dailyTasks: DailyTask[] = [
    {
      id: uuidv4(),
      title: "Daily Login",
      description: "Log in today to claim your token reward",
      tokenReward: LOGIN_TOKEN_REWARD,
      completed: false,
      type: "login",
      requirement: 1,
      progress: 0,
      createdAt: now.toISOString(),
      completedAt: null,
      expiresAt: tomorrow.toISOString(),
    },
    {
      id: uuidv4(),
      title: "Complete 2 Quests",
      description: "Complete any 2 quests to earn tokens",
      tokenReward: 10,
      completed: false,
      type: "complete_task",
      requirement: 2,
      progress: 0,
      createdAt: now.toISOString(),
      completedAt: null,
      expiresAt: tomorrow.toISOString(),
    },
    {
      id: uuidv4(),
      title: "3-Day Login Streak",
      description: "Log in for 3 consecutive days",
      tokenReward: 15,
      completed: false,
      type: "reach_streak",
      requirement: 3,
      progress: 0,
      createdAt: now.toISOString(),
      completedAt: null,
      expiresAt: addDays(tomorrow, 3).toISOString(),
    },
  ];

  saveDailyTasks(dailyTasks);
  return dailyTasks;
};

// Update progress for daily tasks
export const updateDailyTaskProgress = (
  taskType: "login" | "complete_task" | "reach_streak",
  progress: number
): DailyTask[] => {
  const tasks = getDailyTasks();
  let updated = false;

  const updatedTasks = tasks.map((task) => {
    if (task.type === taskType && !task.completed) {
      const newProgress =
        task.type === "reach_streak"
          ? progress // For streak, we set absolute value
          : task.progress + progress; // For others, we increment

      if (newProgress >= task.requirement && !task.completed) {
        // Task completed
        task.completed = true;
        task.completedAt = new Date().toISOString();
        task.progress = task.requirement;

        // Award tokens
        addTokensToUser(task.tokenReward);

        updated = true;
      } else if (newProgress > task.progress) {
        task.progress = newProgress;
        updated = true;
      }
    }
    return task;
  });

  if (updated) {
    saveDailyTasks(updatedTasks);
  }

  return updatedTasks;
};

// Check if daily tasks need to be refreshed
export const refreshDailyTasksIfNeeded = (): boolean => {
  const tasks = getDailyTasks();

  // If no tasks or all tasks expired, generate new ones
  const now = new Date().toISOString();
  const needsRefresh =
    tasks.length === 0 ||
    tasks.every((task) => task.expiresAt < now || task.completed);

  if (needsRefresh) {
    generateDailyTasks();
    return true;
  }

  return false;
};
