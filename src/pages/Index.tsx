import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTask } from "../hooks/use-task";
import { taskApi } from "../services/api";
import { Task } from "../types";
import { useNavigate } from "react-router-dom";
import TaskForm from "@/components/tasks/TaskForm";

// Components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

// Icons
import { CalendarCheck, CheckCircle, Clock, Star, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Index: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { addTask, markTaskComplete } = useTask();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [pendingTasks, setPendingTasks] = useState<Task[]>([]);
  const [isTasksLoading, setIsTasksLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();

  // Task creation state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [tasksLoaded, setTasksLoaded] = useState(false);

  useEffect(() => {
    if (user && !tasksLoaded) {
      loadTasks();
      setTasksLoaded(true);
    }
  }, [user, tasksLoaded]);

  const loadTasks = async () => {
    try {
      setIsTasksLoading(true);
      const allTasks = await taskApi.getTasks();
      setTasks(allTasks);

      // Lọc ra các task chưa hoàn thành
      const pending = allTasks.filter((task: Task) => !task.completed);
      setPendingTasks(pending);
    } catch (error) {
      console.error("Failed to load tasks:", error);
    } finally {
      setIsTasksLoading(false);
    }
  };

  const handleAddTask = async (values: {
    title: string;
    description: string;
    deadline: Date;
    xpReward: number;
  }) => {
    if (!values.title || values.title.trim() === "") {
      toast({
        title: "Error",
        description: "Task title is required",
        variant: "destructive",
      });
      return;
    }
  
    setIsSubmitting(true);
  
  try {
      await addTask({
        title: values.title,
        description: values.description,
        deadline: values.deadline.toISOString(),
        xpReward: values.xpReward,
        updatedAt: new Date().toISOString(),
        owner: user?.username || user?.first_name || "",
      });
  
      // Close dialog
      setIsCreateDialogOpen(false);
  
      // Refresh tasks
      loadTasks();
    } catch (error) {
      console.error("Failed to create task:", error);
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);
  const [taskToConfirm, setTaskToConfirm] = useState<string | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const handleConfirmComplete = (taskId: string | undefined) => {
    if (!taskId) return;
    setTaskToConfirm(taskId);
    setIsConfirmDialogOpen(true);
  };

  const handleCompleteTask = async (taskId: string) => {
    if (!taskId) return;

    setIsConfirmDialogOpen(false);
    setCompletingTaskId(taskId);
    try {
      await markTaskComplete(taskId);
      // Success toast
      toast({
        title: "Task completed!",
        description: "Well done! You've earned XP and tokens.",
        variant: "default",
      });
      // Refresh tasks after completion
      loadTasks();
    } catch (error) {
      console.error("Failed to complete task:", error);
      toast({
        title: "Error",
        description: "Failed to complete the task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCompletingTaskId(null);
    }
  };

  const handleViewAllTasks = () => {
    navigate("/tasks");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="border-primary border-t-2 border-b-2 rounded-full w-12 h-12 animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col justify-center items-center gap-4 h-screen">
        <h2 className="font-bold text-2xl">Welcome to EpicTask</h2>
        <p>Please log in to view your tasks and progress</p>
      </div>
    );
  }

  // Tính toán số liệu thống kê
  const completedTasksCount = tasks.filter((task) => task.completed).length;
  const totalTasksCount = tasks.length;
  const completionRate =
    totalTasksCount > 0
      ? Math.round((completedTasksCount / totalTasksCount) * 100)
      : 0;

  // Calculate XP to next level - assuming each level needs level * 100 XP
  const currentLevel = user.level || 1;
  const xpForNextLevel = currentLevel * 100;
  const currentXP = user.xp || 0;
  const xpProgress = Math.min(
    Math.round((currentXP / xpForNextLevel) * 100),
    100
  );

  return (
    <div className="space-y-6 mx-auto p-4 container">
      {/* Chào mừng người dùng */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-bold text-3xl">
            Welcome back, {user.username || user.first_name}!
          </h1>
          <p className="text-muted-foreground">
            Here's your current progress
            <Button
              variant="ghost"
              size="sm"
              className="ml-2"
              onClick={loadTasks}
              disabled={isTasksLoading}
            >
              {isTasksLoading ? (
                <span className="border-2 border-b-transparent rounded-full w-4 h-4 animate-spin"></span>
              ) : (
                <svg
                  className="w-4 h-4"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                  <path d="M21 3v5h-5" />
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                  <path d="M8 16H3v5" />
                </svg>
              )}
              <span className="sr-only">Refresh data</span>
            </Button>
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-blue-500 text-white">
              <Plus size={16} className="mr-1" /> Create New Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a New Task</DialogTitle>
            </DialogHeader>
            <TaskForm
              onSubmit={(values) => {
                handleAddTask({
                  title: values.title,
                  description: values.description,
                  deadline: values.deadline,
                  xpReward: values.xpReward,
                });
              }}
              onCancel={() => setIsCreateDialogOpen(false)}
              isSubmitting={isSubmitting}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Thống kê người dùng */}
      <div className="gap-4 grid grid-cols-1 md:grid-cols-4">
        <Card>
          <CardContent className="flex flex-col justify-center items-center p-4">
            <div className="bg-primary/10 mb-2 p-3 rounded-full">
              <CheckCircle className="w-6 h-6 text-primary" />
            </div>
            <p className="font-medium text-sm">Completed Tasks</p>
            <h3 className="font-bold text-2xl">{completedTasksCount}</h3>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col justify-center items-center p-4">
            <div className="bg-purple-500/10 mb-2 p-3 rounded-full">
              <Clock className="w-6 h-6 text-purple-500" />
            </div>
            <p className="font-medium text-sm">Pending Tasks</p>
            <h3 className="font-bold text-2xl">{pendingTasks.length}</h3>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col justify-center items-center p-4">
            <div className="bg-blue-500/10 mb-2 p-3 rounded-full">
              <Star className="w-6 h-6 text-blue-500" />
            </div>
            <p className="font-medium text-sm">Total XP</p>
            <h3 className="font-bold text-2xl">{user.xp || 0}</h3>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col justify-center items-center p-4">
            <div className="bg-green-500/10 mb-2 p-3 rounded-full">
              <CalendarCheck className="w-6 h-6 text-green-500" />
            </div>
            <p className="font-medium text-sm">Daily Streak</p>
            <h3 className="font-bold text-2xl">
              {user.dailyLoginStreak || 0} days
            </h3>
          </CardContent>
        </Card>
      </div>

      {/* Tab chức năng - Loại bỏ tab Rewards */}
      <Tabs
        defaultValue="overview"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-2 mb-4 md:w-[300px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Progress Overview</CardTitle>
              <CardDescription>
                Your task completion and level progress
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Task Completion</span>
                  <span className="font-bold text-sm">{completionRate}%</span>
                </div>
                <Progress value={completionRate} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Level Progress</span>
                  <span className="font-bold text-sm">
                    Level {user.level || 1} • {currentXP}/{xpForNextLevel} XP
                  </span>
                </div>
                <Progress value={xpProgress} className="h-2" />
              </div>

              {/* Hiển thị tokens hiện có mà không có phần cửa hàng */}
              <div className="bg-blue-50 mt-4 p-3 border border-blue-100 rounded-lg">
                <div className="flex items-center">
                  <div className="mr-2">
                    <svg
                      className="w-5 h-5 text-blue-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-blue-700">
                      Current Tokens:{" "}
                      <span className="font-bold">{user.tokens || 0}</span>
                    </p>
                    <p className="text-blue-600 text-sm">
                      Complete tasks to earn more tokens!
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle>Your Tasks</CardTitle>
              <CardDescription>
                Manage and track your current tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isTasksLoading ? (
                <div className="flex justify-center p-4">
                  <div className="border-primary border-t-2 border-b-2 rounded-full w-8 h-8 animate-spin"></div>
                </div>
              ) : pendingTasks.length > 0 ? (
                <div className="divide-y">
                  {pendingTasks.slice(0, 5).map((task) => (
                    <div
                      key={task._id}
                      className="flex justify-between items-center py-3"
                    >
                      <div>
                        <h4 className="font-medium">{task.title}</h4>
                        <p className="text-muted-foreground text-sm">
                          {task.description?.substring(0, 60) ||
                            "No description"}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            XP: {task.xpReward || 0}
                          </Badge>
                          {task.deadline &&
                            (() => {
                              const deadlineDate = new Date(task.deadline);
                              const today = new Date();
                              const diffDays = Math.ceil(
                                (deadlineDate.getTime() - today.getTime()) /
                                  (1000 * 60 * 60 * 24)
                              );

                              // Color based on proximity to deadline
                              let badgeClasses = "text-xs ";
                              if (diffDays < 0) {
                                badgeClasses +=
                                  "bg-red-50 text-red-800 border-red-200";
                              } else if (diffDays <= 2) {
                                badgeClasses +=
                                  "bg-amber-50 text-amber-800 border-amber-200";
                              } else {
                                badgeClasses +=
                                  "bg-green-50 text-green-800 border-green-200";
                              }

                              return (
                                <Badge
                                  variant="outline"
                                  className={badgeClasses}
                                >
                                  Due: {deadlineDate.toLocaleDateString()}
                                  {diffDays < 0
                                    ? " (Overdue)"
                                    : diffDays === 0
                                    ? " (Today!)"
                                    : diffDays === 1
                                    ? " (Tomorrow!)"
                                    : ""}
                                </Badge>
                              );
                            })()}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          task._id && handleConfirmComplete(task._id)
                        }
                        disabled={completingTaskId === task._id}
                      >
                        {completingTaskId === task._id ? (
                          <>
                            <span className="mr-2 border-2 border-b-transparent rounded-full w-4 h-4 animate-spin"></span>
                            Completing...
                          </>
                        ) : (
                          "Complete"
                        )}
                      </Button>
                    </div>
                  ))}
                  {pendingTasks.length > 5 && (
                    <div className="pt-2 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleViewAllTasks}
                      >
                        View all {pendingTasks.length} tasks
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="py-4 text-center">
                  You don't have any pending tasks. Great job!
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Task</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to mark this task as complete? This action
            cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsConfirmDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => taskToConfirm && handleCompleteTask(taskToConfirm)}
              disabled={completingTaskId !== null}
            >
              {completingTaskId ? "Completing ..." : "Yes, Complete It"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
