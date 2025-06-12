import React, { createContext, useContext, useState, useEffect } from "react";
import { Task } from "@/types";

import { useAuth } from "./AuthContext";
import { taskApi } from "@/services/api";
import { toast } from "@/hooks/use-toast";

import { useBadge } from "@/contexts/BadgeContext";

interface TaskContextType {
  tasks: Task[];
  isLoading: boolean;  addTask: (
    taskData: Omit<
      Task,
      | "id"
      | "completed"
      | "createdAt"
      | "completedAt"
      | "userId"
    >
  ) => void;
  updateTask: (taskId: string, taskData: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  markTaskComplete: (taskId: string) => void;
  getTodayTasksCount: () => number;
  getCompletedTasksCount: () => number;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { refreshBadges } = useBadge();

  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [user]);

  const loadTasks = async () => {
    setIsLoading(true);
    try {
      const loadedTasks = await taskApi.getTasks();
      setTasks(loadedTasks);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load your tasks.",
        variant: "destructive",
      });
      console.error("Error loading tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const addTask = async (
  taskData: Omit<
    Task,
    | "id"
    | "completed"
    | "createdAt"
    | "completedAt"
    | "userId"
  >
) => {
  if (!user) {
    toast({
      title: "Error",
      description: "You must be logged in to add tasks.",
      variant: "destructive",
    });
    return;
  }

  // Check if user has reached the daily limit (10 tasks)
  if (getTodayTasksCount() >= 10) {
    toast({
      title: "Daily Limit Reached",
      description: "You can only create 10 tasks per day to prevent cheating.",
      variant: "destructive",
    });
    return;
  }
  try {
    // Cap XP reward to prevent abuse
    const xpReward = Math.min(taskData.xpReward, 50); // Cap XP reward at 50

    // Gọi API để tạo task mới
    const newTask = await taskApi.createTask({
      title: taskData.title,
      description: taskData.description,
      deadline: taskData.deadline || "",
      xpReward: xpReward,
    });

    // Cập nhật state với kết quả từ API
    setTasks((prevTasks) => [...prevTasks, newTask]);

    toast({
      title: "Task Added",
      description: `"${newTask.title}" has been added to your tasks.`,
    });
    
    return newTask; // Trả về task mới được tạo
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to add the task.",
      variant: "destructive",
    });
    console.error("Error adding task:", error);
    throw error; // Chuyển tiếp lỗi để xử lý ở component
  }
};

  const updateTask = async (taskId: string, taskData: Partial<Task>) => {
    try {
      const taskIndex = tasks.findIndex((task) => task._id === taskId);

      if (taskIndex === -1) {
        toast({
          title: "Error",
          description: "Task not found.",
          variant: "destructive",
        });
        return;
      }

      // Prevent updating completed tasks
      if (tasks[taskIndex].completed) {
        toast({
          title: "Cannot Update",
          description: "Completed tasks cannot be updated.",
          variant: "destructive",
        });
        return;
      }

      const updatedTask = await taskApi.updateTask(taskId, {
        title: taskData.title,
        description: taskData.description,
        deadline: taskData.deadline || "",
      });

      setTasks((prevTasks) =>
        prevTasks.map((task) => (task._id === taskId ? updatedTask : task))
      );

      toast({
        title: "Task Updated",
        description: `"${updatedTask.title}" has been updated.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update the task.",
        variant: "destructive",
      });
      console.error("Error updating task:", error);
    }
  };

  const getTodayTasksCount = () => {
  if (!user) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Lọc các nhiệm vụ của ngày hôm nay
  const todayTasks = tasks.filter((task) => {
    const taskDate = new Date(task.createdAt);
    
    // Sử dụng trường owner thay vì userId
    return taskDate >= today && task.owner === user._id;
  });

  console.log("Today's tasks filtered:", todayTasks);
  console.log("Today's tasks count:", todayTasks.length);

  return todayTasks.length;
};


  const getCompletedTasksCount = () => {
    if (!user) return 0;

    return tasks.filter((task) => task.completed && task.userId === user._id)
      .length;
  };

  const deleteTask = async (taskId: string) => {
    try {
      const taskToDelete = tasks.find((task) => task._id === taskId);

      if (!taskToDelete) {
        toast({
          title: "Error",
          description: "Task not found.",
          variant: "destructive",
        });
        return;
      }

      // Prevent deleting completed tasks
      if (taskToDelete.completed) {
        toast({
          title: "Cannot Delete",
          description: "Completed tasks cannot be deleted.",
          variant: "destructive",
        });
        return;
      }

      await taskApi.deleteTask(taskId);
      setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId));

      toast({
        title: "Task Deleted",
        description: `"${taskToDelete.title}" has been deleted.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the task.",
        variant: "destructive",
      });
      console.error("Error deleting task:", error);
    }
  };

  // Thông báo hoàn thành nhiệm vụ
  const markTaskComplete = async (taskId: string) => {
  try {
    if (!taskId) {
      toast({
        title: "Error",
        description: "Invalid task ID.",
        variant: "destructive",
      });
      return;
    }

    const taskToComplete = tasks.find((task) => task._id === taskId);
    if (!taskToComplete) {
      toast({
        title: "Error",
        description: "Task not found.",
        variant: "destructive",
      });
      return;    }    
      const response = await taskApi.completeTask(taskId);
    console.log("Complete task response:", response); // Debug log
    
    // Extract the XP earned from the response structure
    const xpEarned = response?.rewards?.xp || 0;
    const leveledUp = response?.leveledUp || false;

    // Cập nhật state
    setTasks((prevTasks) =>
      prevTasks.map((t) =>
        t._id === taskId
          ? {
              ...t,
              completed: true,
              completedAt: new Date().toISOString(),
            }
          : t
      )
    );

    // Hiển thị thông báo
    toast({
      title: "Task completed!",
      description: `You earned ${xpEarned} XP${
        leveledUp ? " and leveled up!" : "!"
      }`,
      variant: "default",
    });

    // Làm mới huy hiệu để kiểm tra nếu đã mở khóa huy hiệu mới
    await refreshBadges();

    // Hiển thị thông báo về huy hiệu mới nếu có
    interface NewBadge {
      title: string;
      description: string;
      icon: string;
    }

    if (response.newBadges && response.newBadges.length > 0) {
      response.newBadges.forEach((badge: NewBadge) => {
        toast({
          title: "Badge Unlocked! 🎉",
          description: `You've earned the "${badge.title}" badge!`,
          variant: "default",
        });
      });
    }

    // Tải lại danh sách nhiệm vụ để đồng bộ
    loadTasks();
  } catch (error) {
    console.error("Error completing task:", error);
    toast({
      title: "Error",
      description: "Failed to complete the task.",
      variant: "destructive",
    });
  }
};

  return (
    <TaskContext.Provider
      value={{
        tasks,
        isLoading,
        addTask,
        updateTask,
        deleteTask,
        markTaskComplete,
        getTodayTasksCount,
        getCompletedTasksCount,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTask() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error("useTask must be used within a TaskProvider");
  }
  return context;
}