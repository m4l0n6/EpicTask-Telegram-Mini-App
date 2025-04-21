
import React from 'react';
import TaskList from '@/components/tasks/TaskList';
import { Star, Swords } from 'lucide-react';


const TasksPage: React.FC = () => {
  return (
    <div>
      <div className="flex items-center mb-6">
        <Swords className="mr-2 w-8 h-8 text-epic-purple" />
        <h1 className="bg-clip-text bg-gradient-to-r from-epic-purple to-epic-blue font-bold text-transparent text-2xl">Your Quests</h1>
        <div className="flex items-center bg-black/5 ml-auto px-3 py-1 rounded-full text-sm">
          <Star className="fill-epic-yellow mr-1 w-4 h-4 text-epic-yellow" />
          <span className="font-medium">Complete quests to earn XP and level up!</span>
        </div>
      </div>

      <TaskList /> 
    </div>
  );
};

export default TasksPage;
