import React, { createContext, useState, useEffect } from "react";
import { Task } from "@/types";

import { useAuth } from "./AuthContext";
import { taskApi } from "@/services/api";
import { toast } from "@/hooks/use-toast";
import { notificationService } from "@/services/notificationService";

import { useBadge } from "@/contexts/BadgeContext";

interface TaskContextType {
  tasks: Task[];
  isLoading: boolean;
  loadTasks: () => Promise<void>;
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

export const TaskContext = createContext<TaskContextType | undefined>(undefined);

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
    const xpReward = Math.min(taskData.xpReward, 100); // Cap XP reward at 100    // Ensure required fields are present
    if (!taskData.title) {
      throw new Error("Task title is required");
    }
    if (!taskData.description) {
      throw new Error("Task description is required");
    }
    if (!taskData.deadline) {
      throw new Error("Task deadline is required");
    }
      // Format the date properly for the API
    const formattedDeadline = typeof taskData.deadline === 'string' 
      ? taskData.deadline
      : (taskData.deadline as Date).toISOString();
    
    // Gọi API để tạo task mới
    const newTask = await taskApi.createTask({
      title: taskData.title,
      description: taskData.description,
      deadline: formattedDeadline,
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
      }      // Format the deadline properly      // Format the deadline properly and handle null values
      let formattedDeadline: string = "";
      if (taskData.deadline) {
        formattedDeadline = typeof taskData.deadline === 'string'
          ? taskData.deadline
          : (taskData.deadline as Date).toISOString();
      } else if (tasks[taskIndex].deadline) {
        formattedDeadline = tasks[taskIndex].deadline;
      } else {
        // If all else fails, set to current date + 1 day
        formattedDeadline = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      }
      
      const updatedTask = await taskApi.updateTask(taskId, {
        title: taskData.title || tasks[taskIndex].title,
        description: taskData.description || tasks[taskIndex].description || "",
        deadline: formattedDeadline,
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

    return tasks.filter((task) => task.completed && task.owner === user._id)
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

    const taskToComplete = tasks.find((task) => task._id === taskId);    if (!taskToComplete) {
      notificationService.notifyError("Task not found.");
      return;
    }

    const response = await taskApi.completeTask(taskId);
    const { xpGained, tokenGained, leveledUp, newBadges } = response;

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
    );    // Hiển thị thông báo
    notificationService.notifyTaskCompleted(xpGained, tokenGained, leveledUp);

    // Hiển thị thông báo về huy hiệu mới nếu có
    if (newBadges && Array.isArray(newBadges) && newBadges.length > 0) {
      // Thêm delay nhỏ để không hiển thị cùng lúc với toast trước đó
      setTimeout(() => {
        newBadges.forEach((badge) => {
          notificationService.notifyNewBadge(badge);
        });
      }, 500);
    }

    // Làm mới huy hiệu để kiểm tra nếu đã mở khóa huy hiệu mới
    await refreshBadges();

    // Tải lại danh sách nhiệm vụ để đồng bộ
    loadTasks();  } catch (error) {
    console.error("Error completing task:", error);
    notificationService.notifyError("Failed to complete the task.");
  }
};

  return (
    <TaskContext.Provider
      value={{
        tasks,
        isLoading,
        loadTasks,
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

export const useTask = () => {
  const context = React.useContext(TaskContext);
  if (context === undefined) {
    throw new Error("useTask must be used within a TaskProvider");
  }
  return context;
}