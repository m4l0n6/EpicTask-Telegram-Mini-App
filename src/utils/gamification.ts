import { Badge } from "@/types";
import { v4 as uuidv4 } from "uuid";

export const XP_PER_LEVEL = 100; // Số điểm kinh nghiệm cần để lên cấp
export const MAX_LEVEL = 50; // Cấp độ tối đa

export const LOGIN_TOKEN_REWARD = 5;
export const STREAK_BONUS_MULTIPLIER = 0.2; 

export const calculateLevel = (xp: number): number => {
  return Math.min(Math.floor(xp / XP_PER_LEVEL) + 1, MAX_LEVEL);
};



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
