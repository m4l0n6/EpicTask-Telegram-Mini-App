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

interface TaskFormProps {
  onCancel: () => void;
}


const TaskForm: React.FC<TaskFormProps> = ({onCancel}) => {
  const form = useForm<FormData>();
  interface FormData {
    title: string;
    description: string;
    deadline: string;
    xpReward: number;
  }

  const handleSubmit = (data: FormData) => {
    console.log("Form submitted:", data);
  }

  return (
    <Form {...form}>
      <form action="" className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
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
            <FormItem>
              <FormLabel>Deadline</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
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
              <FormLabel>XP Reward (1-100)</FormLabel>
              <FormControl>
                <Input type="number" min="1" max="100" {...field} />
              </FormControl>
              <FormDescription>
                Higher XP for more challenging tasks (max 100 XP)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button type="submit" className="cursor-pointer">
            Create task
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default TaskForm