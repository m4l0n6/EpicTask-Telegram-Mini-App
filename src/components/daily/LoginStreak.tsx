
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Flame, Gift } from 'lucide-react';
import { useAuth } from "@/contexts/AuthContext";
import { format, isToday } from 'date-fns';

const LoginStreak: React.FC = () => {
  const { user } = useAuth();

  if (!user || !user.lastDailyLogin) {
    return null;
  }

  const lastLogin = new Date(user.lastDailyLogin);
  const formattedDate = format(lastLogin, "MMM d, yyyy");
  const streak = user.dailyLoginStreak || 0;

  // Determine the streak color class based on the streak count
  const getStreakColorClass = () => {
    if (streak >= 30) return "text-epic-purple";
    if (streak >= 20) return "text-epic-blue";
    if (streak >= 10) return "text-epic-green";
    if (streak >= 5) return "text-epic-yellow";
    return "text-orange-500";
  };

  // Check if last login was today
  const loggedInToday = isToday(lastLogin);
  
  return (
    <Card className="bg-gradient-to-r from-epic-purple/5 to-epic-blue/5 border-2 border-epic-purple/20">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg">
          <Calendar className="mr-2 w-5 h-5 text-epic-purple" />
          Daily Login Streak
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="gap-4 grid grid-cols-2">
          <div className="text-center">
            <div className="flex justify-center items-center mb-1">
              <Calendar className="mr-1 w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground text-sm">Last Login</span>
            </div>
            <p className="font-medium">
              {loggedInToday ? "Today" : formattedDate}
            </p>
          </div>

          <div className="text-center">
            <div className="flex justify-center items-center mb-1">
              <Flame className={`h-4 w-4 mr-1 ${getStreakColorClass()}`} />
              <span className="text-muted-foreground text-sm">
                Current Streak
              </span>
            </div>
            <p className={`text-xl font-bold ${getStreakColorClass()}`}>
              {streak} {streak === 1 ? "day" : "days"} days
            </p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t text-center">
          <div className="flex justify-center items-center mb-1">
            <Gift className="mr-1 w-4 h-4 text-epic-yellow" />
            <span className="text-muted-foreground text-sm">
              Keep logging in daily for bonus rewards!
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoginStreak;
