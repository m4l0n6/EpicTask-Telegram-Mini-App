import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { Task } from "@/types";
import { z } from "zod";
import { CalendarIcon } from "lucide-react";
import { format, parseISO, startOfDay } from "date-fns";
import { vi } from "date-fns/locale";
import { MAX_TASKS_PER_DAY } from "@/utils/gamification";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTask } from "@/contexts/TaskContext";

// Định nghĩa lược đồ biểu mẫu với Zod
const taskFormSchema = z.object({
  title: z.string().min(3, "Title is required").max(100, "Title is too long"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters minimum") // Sửa lỗi typo
    .max(500, "Description is too long"), // Tăng giới hạn description
  deadline: z
    .date({
      required_error: "Deadline is required",
    })
    .min(startOfDay(new Date()), "Deadline must be today or in the future"),
  xpReward: z.coerce
    .number({ required_error: "XP reward is required" })
    .min(1, "Minimum XP reward is 1")
    .max(50, "Maximum XP reward is 50"),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface TaskFormProps {
  task?: Task;
  onCancel: () => void;
  onSubmit: (values: TaskFormValues) => void;
}

export default function TaskForm({ task, onSubmit, onCancel }: TaskFormProps) {
  const { getTodayTasksCount } = useTask();
  const tasksToday = getTodayTasksCount();
  const remainingTasksToday = MAX_TASKS_PER_DAY - tasksToday;

  const defaultValues: Partial<TaskFormValues> = {
    title: task?.title || "",
    description: task?.description || "",
    deadline: task?.deadline ? new Date(task.deadline) : undefined,
    xpReward: task?.xpReward || 10,
  };

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues,
  });

  const handleSubmit = (values: TaskFormValues) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
        {/* Add this indicator of remaining tasks */}
        <div className="flex justify-between items-center text-muted-foreground text-sm">
          <span>
            Daily tasks remaining: {remainingTasksToday}/{MAX_TASKS_PER_DAY}
          </span>
          {remainingTasksToday <= 1 && (
            <span className="font-medium text-orange-500">
              {remainingTasksToday === 0
                ? "Limit reached!"
                : "Last task for today!"}
            </span>
          )}
        </div>

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter task title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter task description"
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="deadline"
          render={({ field }) => {
            // Format date cho HTML input (YYYY-MM-DD)
            const formatDateForInput = (date: Date | undefined) => {
              if (!date) return "";
              return format(date, "yyyy-MM-dd");
            };

            // Parse date từ HTML input string
            const parseDateFromInput = (dateString: string) => {
              if (!dateString) return undefined;
              return parseISO(dateString + "T00:00:00");
            };

            // Ngày tối thiểu (hôm nay)
            const minDate = format(new Date(), "yyyy-MM-dd");

            return (
              <FormItem>
                <FormLabel>Deadline</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="date"
                      min={minDate}
                      value={formatDateForInput(field.value)}
                      onChange={(e) => {
                        const date = parseDateFromInput(e.target.value);
                        field.onChange(date);
                      }}
                      className="pl-10"
                    />
                    <CalendarIcon className="top-1/2 left-3 absolute opacity-50 w-4 h-4 -translate-y-1/2 transform" />
                  </div>
                </FormControl>
                {field.value && (
                  <FormDescription>
                    Deadline:{" "}
                    {format(field.value, "dd-MM-yyyy", { locale: vi })}
                  </FormDescription>
                )}
                {!field.value && (
                  <FormDescription>
                    Choose a deadline for your task
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <FormField
          control={form.control}
          name="xpReward"
          render={({ field }) => (
            <FormItem>
              <FormLabel>XP Reward (1-50)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="1"
                  max="50"
                  placeholder="10"
                  {...field}
                  disabled={!!task} // Disable if editing existing task
                />
              </FormControl>
              <FormDescription>
                Higher XP for more challenging tasks (max 50 XP)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {!task && (
          <FormDescription>
            You've created {tasksToday}/{MAX_TASKS_PER_DAY} tasks today
          </FormDescription>
        )}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-epic-purple hover:bg-epic-purple/90"
            disabled={remainingTasksToday === 0 && !task}
          >
            {task ? "Update Task" : "Create Task"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
