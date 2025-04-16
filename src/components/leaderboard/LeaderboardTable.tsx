import React from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy, Medal, Award, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LeaderboardTable: React.FC = () => {
  // Mock data
  const leaderboard = [
    { rank: 1, userId: '1', username: 'Alice', avatarUrl: '', level: 50, xp: 12000 },
    { rank: 2, userId: '2', username: 'Bob', avatarUrl: '', level: 45, xp: 11000 },
    { rank: 3, userId: '3', username: 'Charlie', avatarUrl: '', level: 40, xp: 10000 },
    { rank: 4, userId: '4', username: 'David', avatarUrl: '', level: 35, xp: 9000 },
    { rank: 5, userId: '5', username: 'Eve', avatarUrl: '', level: 30, xp: 8000 },
    { rank: 6, userId: '6', username: 'Frank', avatarUrl: '', level: 25, xp: 7000 },
    { rank: 7, userId: '7', username: 'Grace', avatarUrl: '', level: 20, xp: 6000 },
    { rank: 8, userId: '8', username: 'Hank', avatarUrl: '', level: 15, xp: 5000 },
    { rank: 9, userId: '9', username: 'Ivy', avatarUrl: '', level: 10, xp: 4000 },
    { rank: 10, userId: '10', username: 'Jack', avatarUrl: '', level: 5, xp: 3000 },
  ];

  const userRankEntry = {
    rank: 15,
    userId: '11',
    username: 'You',
    avatarUrl: '',
    level: 3,
    xp: 1500,
  };

  const user = { id: '11' }; // Current user ID

  const getRankDisplay = (rank: number) => {
    if (rank === 1) {
      return { 
        icon: <Trophy className="fill-epic-yellow w-5 h-5 text-epic-yellow" />,
        color: 'text-epic-yellow'
      };
    } else if (rank === 2) {
      return { 
        icon: <Medal className="fill-slate-400 w-5 h-5 text-slate-400" />,
        color: 'text-slate-400'
      };
    } else if (rank === 3) {
      return { 
        icon: <Award className="fill-amber-700 w-5 h-5 text-amber-700" />,
        color: 'text-amber-700'
      };
    }
    
    return { 
      icon: <span className="font-medium text-sm">{rank}</span>,
      color: 'text-muted-foreground'
    };
  };

  return (
    <Card>
      <CardHeader className="relative">
        <Button
          variant="ghost"
          size="icon"
          className="top-2 right-2 absolute"
          onClick={() => window.history.back()}
        >
          <X className="w-5 h-5" />
          <span className="sr-only">Close</span>
        </Button>
        <CardTitle className="mb-6 font-bold text-2xl text-center">
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Rank</TableHead>
              <TableHead>Player</TableHead>
              <TableHead className="text-right">Level</TableHead>
              <TableHead className="text-right">XP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaderboard.slice(0, 10).map((entry) => {
              const rankDisplay = getRankDisplay(entry.rank);
              const isCurrentUser = entry.userId === user?.id;

              return (
                <TableRow
                  key={entry.userId}
                  className={isCurrentUser ? "bg-primary/10" : ""}
                >
                  <TableCell className="font-medium">
                    <div className="flex justify-center items-center w-8 h-8">
                      {rankDisplay.icon}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage
                          src={entry.avatarUrl}
                          alt={entry.username}
                        />
                        <AvatarFallback>
                          {entry.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className={isCurrentUser ? "font-bold" : ""}>
                        {entry.username} {isCurrentUser && "(You)"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-right">
                    {entry.level}
                  </TableCell>
                  <TableCell className="font-medium text-right">
                    {entry.xp}
                  </TableCell>
                </TableRow>
              );
            })}

            {/* Show user entry if not in top 10 */}
            {userRankEntry && (
              <>
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-1 text-muted-foreground text-center"
                  >
                    ...
                  </TableCell>
                </TableRow>
                <TableRow className="bg-primary/10">
                  <TableCell className="font-medium">
                    <div className="flex justify-center items-center w-8 h-8">
                      <span className="font-medium text-sm">
                        {userRankEntry.rank}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage
                          src={userRankEntry.avatarUrl}
                          alt={userRankEntry.username}
                        />
                        <AvatarFallback>
                          {userRankEntry.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-bold">
                        {userRankEntry.username} (You)
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-right">
                    {userRankEntry.level}
                  </TableCell>
                  <TableCell className="font-medium text-right">
                    {userRankEntry.xp}
                  </TableCell>
                </TableRow>
              </>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default LeaderboardTable;
