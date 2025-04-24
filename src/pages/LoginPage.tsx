import React from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const LoginPage: React.FC = () => {
  const { login, isLoading } = useAuth();

  return (
    <div className="flex justify-center items-center bg-gradient-to-br from-epic-purple/10 to-epic-blue/10 p-4 min-h-screen">
      <Card className="shadow-lg w-full max-w-md animate-fade-in">
        <CardHeader className="text-center">
          <CardTitle className="bg-clip-text bg-gradient-to-r from-epic-purple to-epic-blue font-bold text-transparent text-3xl">
            EpicTasks
          </CardTitle>
          <CardDescription className="text-lg">
            Transform your tasks into an epic adventure
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2 text-center">
            <h3 className="font-semibold text-xl">Game-like productivity</h3>
            <p className="text-muted-foreground">
              Complete tasks, earn XP, level up, and collect badges in a
              gamified experience
            </p>
          </div>

          <div className="gap-4 grid grid-cols-2 py-4">
            <div className="flex flex-col items-center bg-muted/30 p-3 rounded-lg">
              <div className="mb-1 text-2xl">🏆</div>
              <span className="font-medium text-sm">XP & Levels</span>
            </div>
            <div className="flex flex-col items-center bg-muted/30 p-3 rounded-lg">
              <div className="mb-1 text-2xl">🔥</div>
              <span className="font-medium text-sm">Badges</span>
            </div>
            <div className="flex flex-col items-center bg-muted/30 p-3 rounded-lg">
              <div className="mb-1 text-2xl">🏅</div>
              <span className="font-medium text-sm">Leaderboard</span>
            </div>
            <div className="flex flex-col items-center bg-muted/30 p-3 rounded-lg">
              <div className="mb-1 text-2xl">⚡</div>
              <span className="font-medium text-sm">Rewards</span>
            </div>
          </div>
        </CardContent>

        <CardFooter>
          <Button
            className="bg-gradient-to-r from-epic-purple to-epic-blue hover:opacity-90 w-full transition-opacity cursor-pointer"
            onClick={login}
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login with Telegram"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;