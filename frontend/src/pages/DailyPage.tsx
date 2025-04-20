import React from "react";
import { Calendar, CalendarCheck, Gift } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LoginStreak from "@/components/daily/LoginStreak";

const DailyPage: React.FC = () => {
    return (
      <div className="space-y-6">
        <div className="mb-6">
          <div className="flex items-center mb-2">
            <Calendar className="mr-2 w-8 h-8 text-epic-yellow" />
            <h1 className="bg-clip-text bg-gradient-to-r from-epic-yellow to-epic-purple font-bold text-transparent text-2xl">
              Daily Rewards
            </h1>
          </div>
          <p className="text-muted-foreground">
            Complete daily tasks and maintain your login streak to earn tokens!
          </p>
        </div>

        <div className="gap-4 grid grid-cols-1 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-muted-foreground text-sm">
                <CalendarCheck className="mr-1 w-4 h-4 text-epic-green" />
                Login Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-bold text-2xl">4 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-muted-foreground text-sm">
                <Gift className="mr-1 w-4 h-4 text-epic-blue" />
                Daily Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-bold text-2xl">10/10</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-muted-foreground text-sm">
                <img src="/token.png" alt="token" className="mr-1 w-4 h-4" />
                Tokens
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-bold text-2xl">100</p>
            </CardContent>
          </Card>
        </div>

        <LoginStreak />

        <div>
          <h2 className="flex items-center mb-4 font-bold text-xl">
            <Gift className="mr-2 w-5 h-5 text-epic-yellow" />
            Daily Tasks
          </h2>
          {/* <DailyTaskList /> */}
        </div>
      </div>
    );
}

export default DailyPage;