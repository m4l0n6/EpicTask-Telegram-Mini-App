
import React from 'react';

interface LoadingProps {
  message?: string;
}

const Loading: React.FC<LoadingProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-background to-background/70">
      <div className="w-16 h-16 relative">
        <div className="w-16 h-16 rounded-full border-4 border-epic-purple border-t-transparent animate-spin"></div>
        <div className="w-12 h-12 absolute top-2 left-2 rounded-full border-4 border-epic-blue border-b-transparent animate-spin animation-delay-150"></div>
      </div>
      <p className="mt-4 text-xl font-medium text-foreground">{message}</p>
      <p className="text-sm text-muted-foreground mt-2">Getting your epic adventure ready...</p>
    </div>
  );
};

export default Loading;
