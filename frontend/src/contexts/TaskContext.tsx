import React, { createContext, useContext, useState, useEffect } from "react";
import { Task } from "@/types";

import { useAuth } from "./AuthContext";


import { taskApi } from "@/services/api";
import { toast } from "@/hooks/use-toast";

interface TaskContextType {
  tasks: Task[];
  isLoading: boolean;
  addTask: (
    taskData: Omit<
      Task,
      | "id"
      | "completed"
      | "createdAt"
      | "completedAt"
      | "userId"
      | "tokenReward"
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
    | "tokenReward"
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
    // Calculate token reward based on XP (default to 20% of XP)
    const xpReward = Math.min(taskData.xpReward, 100); // Cap XP reward at 100

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
      // Trước khi gọi API, kiểm tra xem ID có hợp lệ không
      if (!taskId) {
        toast({
          title: "Error",
          description: "Invalid task ID.",
          variant: "destructive",
        });
        return;
      }

      // Tìm task trong state để lấy _id nếu tồn tại
      const taskToComplete = tasks.find((task) => task._id === taskId);
      if (!taskToComplete) {
        toast({
          title: "Error",
          description: "Task not found.",
          variant: "destructive",
        });
        return;
      }

      // Sử dụng _id thay vì id nếu cần
      const taskDbId = taskToComplete._id || taskId;

      const response = await taskApi.completeTask(taskDbId);

      const { xpGained, tokenGained, leveledUp } = response;

      // Update local task state
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

      // Show toast with animation
      toast({
        title: "Task completed!",
        description: `You earned ${xpGained} XP and ${tokenGained} tokens${
          leveledUp ? " and leveled up!" : "!"
        }`,
        variant: "default",
      });

      // Force reload tasks to ensure sync with storage
      loadTasks();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Could not complete the task.";
      toast({
        title: "Error",
        description: errorMessage,
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

export const useTask = (): TaskContextType => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error("useTask must be used within a TaskProvider");
  }
  return context;
};