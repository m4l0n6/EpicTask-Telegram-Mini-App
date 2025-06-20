import {
  User,
  Badge,
} from "@/types";
import { v4 as uuidv4 } from "uuid";
import {
  unlockBadge,
  getBadges,
  saveBadges,
} from "./storage";
import { userApi } from "@/services/api";
import { taskApi } from "@/services/api";

// Đinh nghĩa các hằng số cho XP và cấp độ
export const XP_PER_LEVEL = 100;
export const MAX_LEVEL = 50;

// Định nghĩa giới hạn task hàng ngày
export const MAX_TASKS_PER_DAY = 5;

// Initialize default badges for the application
export const initializeDefaultBadges = (): Badge[] => {
  const defaultBadges: Badge[] = [
    {
      _id: uuidv4(),
      title: "Beginner",
      description: "Complete your first task",
      icon: "🌱",
      unlockedAt: null,
      milestoneType: "tasksCompleted",
      milestoneValue: 1,
    },
    {
      _id: uuidv4(),
      title: "Dedicated",
      description: "Complete 10 tasks",
      icon: "⭐",
      unlockedAt: null,
      milestoneType: "tasksCompleted",
      milestoneValue: 10,
    },
    {
      _id: uuidv4(),
      title: "Task Master",
      description: "Complete 50 tasks",
      icon: "🏆",
      unlockedAt: null,
      milestoneType: "tasksCompleted",
      milestoneValue: 50,
    },
    {
      _id: uuidv4(),
      title: "Level 5",
      description: "Reach level 5",
      icon: "5️⃣",
      unlockedAt: null,
      milestoneType: "levelReached",
      milestoneValue: 5,
    },
    {
      _id: uuidv4(),
      title: "Level 10",
      description: "Reach level 10",
      icon: "🔟",
      unlockedAt: null,
      milestoneType: "levelReached",
      milestoneValue: 10,
    },
  ];
  
  saveBadges(defaultBadges);
  return defaultBadges;
};

// Tính toán cấp độ
export const calculateLevel = (xp: number): number => {
  return Math.min(Math.floor(xp / XP_PER_LEVEL) + 1, MAX_LEVEL);
};

// TÍnh toán cấp độ cần thiết
export const xpForNextLevel = (level: number): number => {
  return level * XP_PER_LEVEL;
};

// Tính toán tiền trình cấp độ
export const calculateXpProgress = (user: User): number => {
  const currentLevelXp = (user.level - 1) * XP_PER_LEVEL;
  const nextLevelXp = user.level * XP_PER_LEVEL;
  const xpInCurrentLevel = user.xp - currentLevelXp;
  const xpNeededForNextLevel = nextLevelXp - currentLevelXp;

  return Math.floor((xpInCurrentLevel / xpNeededForNextLevel) * 100);
};

// Helper function to check for level-based badges
export const checkAndUnlockLevelBadges = async (level: number) => {
  try {
    // Lấy danh sách tất cả huy hiệu
    const allBadges = await getBadges();
    
    // Tìm các huy hiệu liên quan đến cấp độ
    const levelBadges = allBadges.filter(
      (badge) => badge.milestoneType === "levelReached"
    );

    // Kiểm tra và mở khóa các huy hiệu phù hợp
    for (const badge of levelBadges) {
      if (
        badge.milestoneValue !== undefined &&
        level >= badge.milestoneValue &&
        !badge.unlockedAt
      ) {
        await unlockBadge(badge._id);
      }
    }
  } catch (error) {
    console.error("Error checking for level badges:", error);
  }
};

// Giả lập quá trình hoàn thành nhiệm vụ
export const completeTask = async (taskId: string) => {
  try {
    // Gọi API để đánh dấu nhiệm vụ đã hoàn thành
    const result = await taskApi.completeTask(taskId);
    
    if (result && result.task) {
      const { task, xpEarned } = result;
      
      // Check for task completion badges
      await checkTaskCompletionBadges();
      
      return {
        task,
        rewards: {
          xp: xpEarned || 0,
        },
      };
    }
    
    return null;
  } catch (error) {
    console.error("Error completing task:", error);
    throw error;
  }
};

// Kiểm tra và mở khóa huy hiệu dựa trên số nhiệm vụ đã hoàn thành
export const checkTaskCompletionBadges = async () => {
  try {
    // Lấy thông tin người dùng từ API
    const user = await userApi.getProfile();
    const completedTasksCount = user.completedTasks || 0;
    
    // Lấy danh sách tất cả huy hiệu
    const allBadges = await getBadges();
    
    // Tìm các huy hiệu liên quan đến hoàn thành nhiệm vụ
    const taskBadges = allBadges.filter(
      (badge) => badge.milestoneType === "tasksCompleted"
    );
    
    // Kiểm tra và mở khóa các huy hiệu phù hợp
    for (const badge of taskBadges) {
      if (
        badge.milestoneValue !== undefined &&
        completedTasksCount >= badge.milestoneValue &&
        !badge.unlockedAt
      ) {
        await unlockBadge(badge._id);
      }
    }
  } catch (error) {
    console.error("Error checking for task completion badges:", error);
  }
};
