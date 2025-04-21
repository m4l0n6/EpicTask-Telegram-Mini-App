import React from "react";
import { Task } from "@/types";
import { formatDistanceToNow, isPast, isToday, parseISO } from "date-fns";
import { useTask } from "@/contexts/TaskContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  CheckCircle2,
  Edit,
  Star,
  Trash2,
  Clock,
 Award,
} from "lucide-react";

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit }) => {
    const { deleteTask } = useTask();

    // Đánh dấu tác vụ là đã hoàn thành
    const handleComplete = () => {
      alert("Task completed!");
    };

    // Xóa tác vụ
    const handleDelete = () => {
      deleteTask(task.id);
    };

    // Định dạng ngày hết hạn để hiển thị
    const getDeadlineDisplay = () => {
        if (!task.deadline) return null;
    
        const deadlineDate = parseISO(task.deadline);
        const isPastDeadline = isPast(deadlineDate) && !isToday(deadlineDate);
        const isTodayDeadline = isToday(deadlineDate);
    
        return (
          <Badge
            variant={
              isPastDeadline
                ? "destructive"
                : isTodayDeadline
                ? "default"
                : "secondary"
            }
            className="animate-pulse-scale"
          >
            <Clock className="mr-1 w-3 h-3" />
            {isTodayDeadline
              ? "Today"
              : isPastDeadline
              ? "Overdue"
              : formatDistanceToNow(deadlineDate, { addSuffix: true })}
          </Badge>
        );
    }

    // Chọn màu viền dựa trên phần thưởng XP
    const getBorderColor = () => {
      if (task.xpReward >= 80) return "border-epic-purple";
      if (task.xpReward >= 50) return "border-epic-blue";
      if (task.xpReward >= 30) return "border-epic-yellow";
      return "border-gray-200";
    };

    // Nhận nhãn độ hiếm dựa trên phần thưởng XP
    const getRarityLabel = () => {
      if (task.xpReward >= 80) return "Legendary";
      if (task.xpReward >= 50) return "Epic";
      if (task.xpReward >= 30) return "Rare";
      return "Common";
    };

    // Nhận lớp màu độ hiếm
    const getRarityColorClass = () => {
      if (task.xpReward >= 80) return "text-epic-purple";
      if (task.xpReward >= 50) return "text-epic-blue";
      if (task.xpReward >= 30) return "text-epic-yellow";
      return "text-gray-400";
    };

    return (
      <Card
        className={`task-card-hover ${
          task.completed ? "bg-muted/50" : ""
        } border-2 ${getBorderColor()} transition-all hover:shadow-lg transform hover:-translate-y-1`}
      >
        <CardHeader className="relative pb-2">
          <div className="flex justify-between items-start">
            <CardTitle
              className={`${
                task.completed ? "line-through text-muted-foreground" : ""
              }`}
            >
              {task.title}
            </CardTitle>
            <div className="flex flex-col items-end">
              <Badge
                variant="outline"
                className="flex items-center mb-1 animate-pulse"
              >
                <Star
                  className={`h-3 w-3 mr-1 fill-epic-yellow stroke-epic-yellow ${
                    task.xpReward >= 50 ? "animate-pulse" : ""
                  }`}
                />
                <span className="font-bold text-epic-yellow">
                  {task.xpReward} XP
                </span>
              </Badge>
              <span
                className={`text-xs font-semibold ${getRarityColorClass()}`}
              >
                {getRarityLabel()}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <p
            className={`text-sm ${
              task.completed ? "text-muted-foreground" : ""
            }`}
          >
            {task.description}
          </p>

          <div className="flex flex-wrap gap-2 mt-3">
            {getDeadlineDisplay()}

            {task.completed && (
              <Badge
                variant="default"
                className="bg-epic-green text-white animate-bounce-in"
              >
                <CheckCircle2 className="mr-1 w-3 h-3" />
                Completed
              </Badge>
            )}
          </div>
        </CardContent>

        <CardFooter className="pt-1">
          {task.completed ? (
            <div className="w-full text-muted-foreground text-xs text-right">
              <span className="flex justify-end items-center">
                <Award className="mr-1 w-3 h-3 text-epic-green" />
                Completed{" "}
                {/* {formatDistanceToNow(parseISO(task.completedAt!), {
                  addSuffix: true,
                })} */}
              </span>
            </div>
          ) : (
            <div className="flex justify-between gap-2 w-full">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="mr-1 w-4 h-4" />
                    Delete
                  </Button>
                </DialogTrigger>
                <DialogContent className="border-2 border-destructive/50">
                  <DialogHeader>
                    <DialogTitle>Confirm Deletion</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete this quest? This action
                      cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => {}}>
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDelete}>
                      Delete
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button
                variant="outline"
                size="sm"
                className="flex-1 hover:bg-blue-500/10 hover:text-blue-500"
                onClick={onEdit}
              >
                <Edit className="mr-1 w-4 h-4" />
                Edit
              </Button>

              <Button
                variant="default"
                size="sm"
                className="flex-1 bg-epic-green hover:bg-epic-green/90 animate-pulse-scale"
                onClick={handleComplete}
              >
                <CheckCircle2 className="mr-1 w-4 h-4" />
                Complete
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    );
}

export default TaskCard;