import React, {useState} from "react";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { useTask } from "@/contexts/TaskContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import TaskForm from "@/components/tasks/TaskForm";
import LevelUp from "@/components/ui/LevelUp";
import { calculateXpProgress } from "@/utils/gamification";
import { Sparkles, Crown, Flame, CirclePlus, Trophy, Swords, CheckCircle } from "lucide-react";

const HomePage: React.FC = () => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  // const [showXpGain, setShowXpGain] = useState(false);
  // const [xpAmount, setXpAmount] = useState(0);
  const [newLevel, setNewLevel] = useState(1);

  const { tasks, getTodayTasksCount, addTask } = useTask();
  const { user } = useAuth();

  const recentTasks = tasks
    .filter((task) => !task.completed)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 3);

  const todaysCompletedTasks = tasks.filter((task) => {
    if (!task.completed || !task.completed) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return task.updatedAt && new Date(task.updatedAt) >= today;
  }).length;
  // Hàm xử lý thêm nhiệm vụ mới (sử dụng API)
  const handleAddTask = async (values: {
    title?: string;
    description?: string;
    deadline?: Date | null;
    xpReward?: number;
  }) => {
    // Kiểm tra xem người dùng đã nhập tiêu đề chưa
    if (!values.title || values.title.trim() === "") {
      return; // Không cho phép tiêu đề trống
    }

    try {
      const taskData = {
        title: values.title,
        description: values.description || "",
        deadline: values.deadline ? values.deadline.toISOString() : null,
        xpReward: values.xpReward || 10,
        updatedAt: new Date().toISOString(), // Add updatedAt property
        owner: user?._id || "", // Add owner property
      };

      // Gọi addTask từ TaskContext (đã được cập nhật để sử dụng API)
      await addTask(taskData);
      setShowAddDialog(false);
    } catch (error) {
      console.error("Error adding task:", error);
      // Có thể hiển thị thông báo lỗi ở đây
    }
  };

  const simulateLevelUp = () => {
    setNewLevel(2);
    setShowLevelUp(true);
  };

  const xpProgress = user ? calculateXpProgress(user) : 0;

  const getLevelDisplayClass = () => {
    if (!user) return "bg-gradient-to-r from-epic-yellow to-amber-400";
    if (user.level >= 30)
      return "bg-gradient-to-r from-epic-purple to-epic-blue";
    if (user.level >= 20)
      return "bg-gradient-to-r from-epic-blue to-epic-green";
    if (user.level >= 10)
      return "bg-gradient-to-r from-epic-yellow to-epic-green";
    return "bg-gradient-to-r from-epic-yellow to-amber-400";
  };
  return (
    <div className="space-y-6">
      {/* Hiển thị tiến độ của người dùng */}
      <Card className="bg-gradient-to-r from-epic-purple/10 to-epic-blue/10 shadow-lg border-2 border-epic-purple/50 hover:scale-[1.01] transition-all transform">
        <CardHeader>
          <div className="flex items-center">
            <Sparkles className="mr-2 w-6 h-6 text-epic-yellow animate-pulse" />
            <CardTitle className="text-2xl">
              Welcome back, {user?.username}!
            </CardTitle>
          </div>
          <CardDescription className="flex items-center">
            <div
              className={`px-2 py-1 rounded-md text-white bg-gradient-to-r ${getLevelDisplayClass()} from-epic-yellow to-amber-400 mr-2 font-bold`}
            >
              Level {user?.level}
            </div>
            <span>Newbie</span>
            <span className="mx-2">•</span>
            <div className="flex items-center">
              <Crown className="mr-1 w-4 h-4 text-epic-yellow" />
              <span>Rank #1</span>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="flex items-center font-medium text-sm">
                <Flame className="mr-1 w-4 h-4 text-epic-purple" />
                Experience Progress
              </span>
              <span className="text-muted-foreground text-sm">
                {100 - xpProgress}% to Level {user?.level ? user.level + 1 : 1}
              </span>
            </div>
            <div className="relative bg-primary/20 rounded-full h-2 overflow-hidden">
              <Progress
                value={xpProgress}
                className="absolute inset-0 h-full transition-all animate-pulse"
              />
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <div className="bg-muted/30 p-3 rounded-lg text-center hover:scale-105 transition-transform transform">
              <p className="font-bold text-3xl">{getTodayTasksCount()}/10</p>
              <p className="text-muted-foreground text-sm">Daily Quests</p>
            </div>
            <div className="bg-muted/30 p-3 rounded-lg text-center hover:scale-105 transition-transform transform">
              <p className="font-bold text-epic-green text-3xl">
                {todaysCompletedTasks}
              </p>
              <p className="text-muted-foreground text-sm">Completed Today</p>
            </div>
            <div className="bg-muted/30 p-3 rounded-lg text-center hover:scale-105 transition-transform transform">
              <p className="font-bold text-3xl animate-pulse-scale xp-text">
                {user?.xp || 0}
              </p>
              <p className="text-muted-foreground text-sm">Total XP</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Nút thêm nhiệm vụ mới và xem bảng xếp hạng */}
      <div className="gap-4 grid grid-cols-2">
        {/* Tạo nhiệm vụ mới */}
        <Button
          variant="default"
          size="lg"
          className="bg-epic-purple hover:bg-epic-purple/90 shadow-md border-2 border-epic-purple/50 h-16 transition-all hover:translate-y-[-2px] cursor-pointer transform"
          onClick={() => setShowAddDialog(true)}
        >
          <CirclePlus className="mr-2 w-5 h-5" />
          Start New Quest
        </Button>
        {/* Xem bảng xếp hạng */}
        <Button
          variant="outline"
          size="lg"
          className="hover:bg-epic-yellow/10 shadow-md border-2 border-epic-yellow/50 h-16 transition-all hover:translate-y-[-2px] cursor-pointer transform"
          onClick={simulateLevelUp}
        >
          <Trophy className="mr-2 w-5 h-5 text-epic-yellow" />
          View Leaderboard
        </Button>
      </div>

      {/* Thông báo mới nhất */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h2 className="flex items-center font-bold text-xl">
            <Swords className="mr-2 w-5 h-5 text-epic-purple" />
            Active Quests
          </h2>
          <Link to="/tasks">
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-epic-purple/10 hover:text-epic-purple"
            >
              View All
            </Button>
          </Link>
        </div>

        {recentTasks.length === 0 ? (
          <Card className="border-2 border-epic-purple/30 border-dashed">
            <CardContent className="py-8 text-center">
              <p className="mb-4 text-muted-foreground">No active quests</p>
              <Button
                onClick={() => setShowAddDialog(true)}
                className="bg-epic-purple hover:bg-epic-purple/90"
              >
                Start your first quest
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {recentTasks.map((task) => {
              // Get border color based on XP reward
              let borderClass = "";
              if (task.xpReward >= 80) borderClass = "border-epic-purple";
              else if (task.xpReward >= 50) borderClass = "border-epic-blue";
              else if (task.xpReward >= 30) borderClass = "border-epic-yellow";

              return (
                <Card
                  key={task._id}
                  className={`task-card-hover border-2 ${borderClass} transform hover:translate-x-1 transition-all`}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{task.title}</h3>
                        <p className="mt-1 text-muted-foreground text-sm line-clamp-1">
                          {task.description}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="flex items-center ml-2"
                      >
                        <Star className="fill-epic-yellow stroke-epic-yellow mr-1 w-3 h-3" />
                        {task.xpReward} XP
                      </Badge>
                    </div>

                    <Link to="/tasks">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="bg-epic-green/10 hover:bg-epic-green/20 mt-3 border border-muted w-full"
                      >
                        <CheckCircle className="mr-2 w-4 h-4" />
                        Complete Quest
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="border-2 border-epic-purple/50">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Swords className="mr-2 w-5 h-5 text-epic-purple" />
              Create New Quest
            </DialogTitle>
          </DialogHeader>          <TaskForm
            onSubmit={handleAddTask}
            onCancel={() => setShowAddDialog(false)}
            isSubmitting={false}
          />
        </DialogContent>
      </Dialog>

      {showLevelUp && (
        <LevelUp level={newLevel} onComplete={() => setShowLevelUp(false)} />
      )}
    </div>

    // Phần trang chủ khi chưa đăng nhập
    // <div className="flex flex-col justify-center items-center bg-gradient-to-r from-epic-purple to-epic-blue h-screen">
    // <h1 className="font-bold text-white text-4xl">Welcome to EpicTasks!</h1>
    // <p className="mt-4 text-white text-lg">
    //     Your task management solution for the Epic Web3 world.
    // </p>
    // </div>
  );
}

export default HomePage;