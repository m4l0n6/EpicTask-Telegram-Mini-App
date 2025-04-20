import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Award, CheckCircle2, Star, Trophy } from "lucide-react";

const ProfileCard: React.FC = () => (
  <Card className="w-full">
    <CardHeader className="pb-3">
      <div className="flex flex-col items-center">
        <Avatar className="mb-4 border-4 border-epic-purple w-24 h-24">
          <AvatarImage src='https://placehold.co/20x20' alt='username' />
          <AvatarFallback className="text-2xl">
            Username
          </AvatarFallback>
        </Avatar>

        <CardTitle className="font-bold text-2xl">User</CardTitle>
        <CardDescription>Adventurer for 100</CardDescription>
      </div>
    </CardHeader>

    <CardContent className="space-y-5">
      {/* Level and XP */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="font-medium text-sm">Level 100</span>
          <span className="text-muted-foreground text-sm">
            100 / {100} XP to Level 100
          </span>
        </div>
        <Progress value={100} className="h-2" />
        <div className="flex justify-between text-muted-foreground text-xs">
          <span>Total: 100 XP</span>
          <span>Next: 100 XP</span>
        </div>
      </div>

      {/* Stats */}
      <div className="gap-4 grid grid-cols-3 py-2">
        <div className="flex flex-col items-center bg-muted/30 p-3 rounded-lg">
          <Trophy className="mb-1 w-6 h-6 text-epic-yellow" />
          <span className="font-bold text-xl">100</span>
          <span className="text-muted-foreground text-xs">Rank</span>
        </div>

        <div className="flex flex-col items-center bg-muted/30 p-3 rounded-lg">
          <CheckCircle2 className="mb-1 w-6 h-6 text-epic-green" />
          <span className="font-bold text-xl">100</span>
          <span className="text-muted-foreground text-xs">Tasks</span>
        </div>

        <div className="flex flex-col items-center bg-muted/30 p-3 rounded-lg">
          <Award className="mb-1 w-6 h-6 text-epic-purple" />
          <span className="font-bold text-xl">100</span>
          <span className="text-muted-foreground text-xs">Badges</span>
        </div>
      </div>

      {/* Total XP */}
      <div className="flex justify-center items-center bg-gradient-to-r from-epic-purple/10 to-epic-blue/10 p-4 rounded-lg">
        <Star className="fill-epic-yellow mr-3 w-8 h-8 text-epic-yellow" />
        <div>
          <div className="font-bold text-2xl">1000 XP</div>
          <div className="text-muted-foreground text-sm">Total Experience</div>
        </div>
      </div>
    </CardContent>

    <CardFooter className="flex justify-center">
      <Button variant="outline">
        Sign Out
      </Button>
    </CardFooter>
  </Card>
);

export default ProfileCard;