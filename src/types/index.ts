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
