import React, { useState } from "react";
import { Task } from '@/types';
import Loading from '../ui/Loading';
import { useTask } from "@/contexts/TaskContext";
import { useAuth } from "@/contexts/AuthContext";
import TaskForm from "./TaskForm";
import { Button } from "@/components/ui/button";
import TaskCard from "./TaskCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, ListFilter } from "lucide-react";


const TaskList: React.FC = () => {
    const { tasks, isLoading, addTask, updateTask } = useTask();
    const { user } = useAuth();
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const [sortOption, setSortOption] = useState<'newest' | 'oldest' | 'xp-high' | 'xp-low' | 'deadline'>('newest');

    // Lọc các tác vụ dựa trên tab đang hoạt động
    const filteredTasks = tasks.filter(task => {
        if (activeTab === 'all') return true;
        if (activeTab === 'active') return !task.completed;
        if (activeTab === 'completed') return task.completed;
        return true;
    })

    // Sắp xếp các tác vụ đã lọc
    const sortedTasks = [...filteredTasks].sort((a, b) => {
        switch (sortOption) {
            case 'newest':
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            case 'oldest':
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            case 'xp-high':
                return b.xpReward - a.xpReward;
            case 'xp-low':
                return a.xpReward - b.xpReward;
            case 'deadline':
                if (!a.deadline) return 1;
                if (!b.deadline) return -1;
                return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
            default:
                return 0;
        }
    })

    // Xử lý thêm tác vụ
    const handleAddTask = (values: { title?: string; description?: string; deadline?: Date; xpReward?: number }) => {
      // Kiểm tra title không được để trống
      if (!values.title || values.title.trim() === "") {
        // Có thể hiển thị thông báo lỗi ở đây
        return;
      }

      // Chuyển đổi Date thành chuỗi ISO cho API
      const taskData: Omit<
        Task,
        "id" | "completed" | "createdAt" | "completedAt" | "userId"
      > = {
        title: values.title || "",
        description: values.description || "",
        deadline: values.deadline ? values.deadline.toISOString() : null,
        xpReward: Math.min(values.xpReward || 10, 50), // Ensure XP doesn't exceed 50

        updatedAt: values.deadline ? values.deadline.toISOString() : null,
        owner: user?._id || "",
      };

       try {
         addTask(taskData);
         setShowAddDialog(false);
         // Có thể hiển thị thông báo thành công ở đây
       } catch (error) {
         console.error("Lỗi khi thêm nhiệm vụ:", error);
         // Hiển thị thông báo lỗi
       }
    }

    // Xử lý chỉnh sửa tác vụ
    const handleEditTask = (task: Task) => {
        setEditingTask(task);
        setShowEditDialog(true);
    }

    // Xử lý cập nhật tác vụ
    const handleUpdateTask = (values: { title?: string; description?: string; deadline?: Date; xpReward?: number }) => {
        if (editingTask) {
            // Chuyển đổi Date thành chuỗi ISO cho API
            const taskData: Omit<Task, 'id' | 'completed' | 'createdAt' | 'completedAt' | 'userId'> = {
                title: values.title || '',
                description: values.description || '',
                deadline: values.deadline ? values.deadline.toISOString() : null,
                xpReward: values.xpReward || 10,
                updatedAt: values.deadline ? values.deadline.toISOString() : null,
                owner: user?._id || "",
            }

            updateTask(editingTask._id || '', taskData);
            setShowEditDialog(false);
        }
    }

    if (isLoading) {
    return <Loading message="Loading tasks..." />;
    }
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <Tabs
            defaultValue="all"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="flex justify-between items-center">
              <TabsList>
                <TabsTrigger value="all">All Tasks</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <ListFilter className="mr-1 w-4 h-4" />
                      Sort
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setSortOption("newest")}>
                      Newest First
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortOption("oldest")}>
                      Oldest First
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortOption("xp-high")}>
                      Highest XP
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortOption("xp-low")}>
                      Lowest XP
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortOption("deadline")}>
                      Earliest Deadline
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <TabsContent value="all" className="mt-4">
              {sortedTasks.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="mb-4 text-muted-foreground">No tasks found</p>
                  <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                    <DialogTrigger asChild>
                      <Button onClick={() => setShowAddDialog(true)} className="bg-epic-purple hover:bg-epic-purple/90">
                        Create your first task
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create a New Task</DialogTitle>
                      </DialogHeader>
                      <TaskForm
                        onSubmit={handleAddTask}
                        onCancel={() => setShowAddDialog(false)}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              ) : (
                <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                  {sortedTasks.map((task) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      onEdit={() => handleEditTask(task)}
                    />
                  ))}
                  <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                    <DialogTrigger asChild>
                      <Button
                        className="sm:col-span-2 bg-epic-purple hover:bg-epic-purple/90 sm:w-[50%]"
                        size="sm"
                      >
                        <Plus className="mr-1 w-4 h-4" />
                        Add new Task
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create a New Task</DialogTitle>
                      </DialogHeader>
                      <TaskForm
                        onSubmit={handleAddTask}
                        onCancel={() => setShowAddDialog(false)}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </TabsContent>

            <TabsContent value="active" className="mt-4">
              {sortedTasks.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="mb-4 text-muted-foreground">No active tasks</p>
                  <Button onClick={() => setShowAddDialog(true)} className="bg-epic-purple hover:bg-epic-purple/90">
                    Add a new task
                  </Button>
                </div>
              ) : (
                <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                  {sortedTasks.map((task) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      onEdit={() => handleEditTask(task)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed" className="mt-4">
              {sortedTasks.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-muted-foreground">
                    No completed tasks yet
                  </p>
                </div>
              ) : (
                <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                  {sortedTasks.map((task) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      onEdit={() => handleEditTask(task)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
            </DialogHeader>
            {editingTask && (
              <TaskForm
                task={editingTask}
                onSubmit={handleUpdateTask}
                onCancel={() => {
                  setShowEditDialog(false);
                  setEditingTask(null);
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
}

export default TaskList;