
import React from 'react';
import { useDailyTask } from '@/contexts/DailyTaskContext';
import DailyTaskCard from './DailyTaskCard';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const DailyTaskList: React.FC = () => {
  const { dailyTasks, isLoading, refreshTasks } = useDailyTask();
  
  if (isLoading) {
    return (
      <div className="flex justify-center my-8">
        <p>Loading daily tasks...</p>
      </div>
    );
  }
  
  if (dailyTasks.length === 0) {
    return (
      <Card className="border-2 border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-10">
          <p className="text-muted-foreground mb-4">No active daily tasks</p>
          <Button onClick={refreshTasks} variant="outline" className="flex items-center">
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh Tasks
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  // Sort tasks: active first, then by completion status
  const sortedTasks = [...dailyTasks].sort((a, b) => {
    if (a.completed === b.completed) return 0;
    return a.completed ? 1 : -1;
  });
  
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={refreshTasks} variant="outline" size="sm" className="flex items-center">
          <RefreshCcw className="h-3 w-3 mr-1" />
          Refresh
        </Button>
      </div>
      
      {sortedTasks.map(task => (
        <DailyTaskCard key={task.id} task={task} />
      ))}
    </div>
  );
};

export default DailyTaskList;
