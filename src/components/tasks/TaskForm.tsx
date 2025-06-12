import React from 'react'
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { MAX_TASKS_PER_DAY } from "@/utils/gamification";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTask } from "@/contexts/TaskContext";

// Định ng nghĩa lược đồ biểu mẫu với Zod
const taskFormSchema = z.object({
  title: z.string().min(3, "Title is required").max(100, "Title is too long"),
  description: z
    .string()
    .min(20, "Decription must be at least 10 characters minimum")
    .max(100, "Description is too long"),
  deadline: z
    .date({
      required_error: "Deadline is required",
    })
    .min(
      new Date(new Date().setHours(0, 0, 0, 0)),
      "Deadline must be in the future"
    ),
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

export default function TaskForm({
  task,
  onSubmit,
  onCancel,
}: TaskFormProps) {
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
      <form
        action=""
        className="space-y-4"
        onSubmit={form.handleSubmit(handleSubmit)}
      >
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
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Deadline (Optional)</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="opacity-50 ml-auto w-4 h-4" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-auto" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ?? undefined}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date < new Date(new Date().setHours(0, 0, 0, 0))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                Set a deadline for your task to stay on track
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="xpReward"
          render={({ field }) => (
            <FormItem>
              <FormLabel>XP Reward (1-50)</FormLabel>
              <FormControl>
                <Input type="number" min="1" max="50" {...field} />
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
            You've created {tasksToday}/10 tasks today
          </FormDescription>
        )}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-epic-purple hover:bg-epic-purple/90"
          >
            {task ? "Update Task" : "Create Task"}
          </Button>
        </div>
      </form>
    </Form>
  );
};