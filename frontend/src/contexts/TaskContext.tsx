import React, { createContext, useContext, useState, useEffect } from "react";
import { Task } from "@/types";
import {
  getTasks,
  updateTask as updateTaskInStorage,
  deleteTask as deleteTaskInStorage,
} from "@/utils/storage";
import { v4 as uuidv4 } from "uuid";
// import { addXP } from "@/utils/gamification";

type TaskContextType = {
  tasks: Task[];
  isLoading: boolean;
  addTask: (task: Omit<Task, "id" | "completed" | "createdAt">) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  toggleComplete: (id: string) => void;
  // markTaskComplete: (taskId: string) => void;
  deleteTask: (id: string) => void;
};

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      // Tải danh sách nhiệm vụ khi component được mount
      const loadTasks = async () => {
        try {
          const storedTasks = getTasks();
          setTasks(storedTasks);
        } catch (error) {
          console.error("Error loading tasks:", error);
        } finally {
          setIsLoading(false);
        }
      };

      loadTasks();
    }, []);

    const addTask = (
      taskData: Omit<Task, "id" | "completed" | "createdAt">
    ) => {
      const newTask: Task = {
        id: uuidv4(),
        title: taskData.title,
        description: taskData.description || "",
        deadline: taskData.deadline || null,
        completed: false,
        createdAt: new Date().toISOString(),
        xpReward: taskData.xpReward || 10,
        tokenReward:
          taskData.tokenReward || Math.ceil((taskData.xpReward || 10) / 5),
      };

      setTasks((prevTasks) => [...prevTasks, newTask]);
      setTasks([...tasks, newTask]);;
    };

    const updateTask = (id: string, updates: Partial<Task>) => {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === id ? { ...task, ...updates } : task
        )
      );

      const task = tasks.find((t) => t.id === id);
      if (task) {
        const updatedTask = { ...task, ...updates };
        updateTaskInStorage(updatedTask);
      }
    };

    // Thông báo hoàn thành nhiệm vụ
    // const markTaskComplete = (taskId: string) => {
    //   try {
    //     const { task, xpGained, tokenGained, leveledUp } = completeTask(taskId);

    //     // Update local task state
    //     setTasks((prevTasks) =>
    //       prevTasks.map((t) =>
    //         t.id === taskId
    //           ? { ...t, completed: true, completedAt: new Date().toISOString() }
    //           : t
    //       )
    //     );

    //     // Show toast with animation
    //     toast({
    //       title: "Task Completed!",
    //       description: `You earned ${xpGained} XP and ${tokenGained} tokens${
    //         leveledUp ? " and leveled up!" : "!"
    //       }`,
    //       variant: "default",
    //     });

    //     // Force reload tasks to ensure sync with storage
    //     loadTasks();
    //   } catch (error) {
    //     const errorMessage =
    //       error instanceof Error
    //         ? error.message
    //         : "Failed to complete the task.";
    //     toast({
    //       title: "Error",
    //       description: errorMessage,
    //       variant: "destructive",
    //     });
    //   }
    // };

    const toggleComplete = (id: string) => {
      const task = tasks.find((t) => t.id === id);
      if (!task) return;

      const wasCompleted = task.completed;
      const updatedTask = { ...task, completed: !wasCompleted };

      setTasks((prevTasks) =>
        prevTasks.map((t) => (t.id === id ? updatedTask : t))
      );

      updateTaskInStorage(updatedTask);

      // Nếu đánh dấu hoàn thành (chưa hoàn thành trước đó), thì thêm XP
      if (!wasCompleted && updatedTask.completed) {
        // addXP(updatedTask.xpReward || 0);
        // Thêm token cũng có thể được thực hiện ở đây
      }
    };

    const deleteTask = (id: string) => {
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
      deleteTaskInStorage(id);
    };

    const value = {
      tasks,
      isLoading,
      addTask,
      updateTask,
      // markTaskComplete,
      toggleComplete,
      deleteTask,
    };

    return (
      <TaskContext.Provider value={value}>{children}</TaskContext.Provider>
    );
}

export const useTask = (): TaskContextType => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error("useTask must be used within a TaskProvider");
  }
  return context;
};