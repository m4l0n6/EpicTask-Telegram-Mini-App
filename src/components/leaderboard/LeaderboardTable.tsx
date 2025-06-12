import React, { useEffect } from "react";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trophy, Medal, Award, RefreshCw } from "lucide-react";
import Loading from "../ui/Loading";
import { Button } from "@/components/ui/button";

const LeaderboardTable: React.FC = () => {
  const { leaderboard, isLoading, refreshLeaderboard } =
    useLeaderboard();
  const { user } = useAuth();
  useEffect(() => {
    refreshLeaderboard(); 
  }, []);

  if (isLoading) {
    console.log(leaderboard)
    return <Loading message="Loading leaderboard..." />;
  }

  if (leaderboard.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-center">EpicTasks Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center">
            No leaderboard data available. Try refreshing the leaderboard.
          </p>
          <div className="flex justify-center mt-4">
            <Button onClick={refreshLeaderboard} variant="outline">
              <RefreshCw className="mr-2 w-4 h-4" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get position-specific icons and styles
  const getRankDisplay = (rank: number) => {
    if (rank === 1) {
      return {
        icon: <Trophy className="fill-epic-yellow w-5 h-5 text-epic-yellow" />,
        color: "text-epic-yellow",
      };
    } else if (rank === 2) {
      return {
        icon: <Medal className="fill-slate-400 w-5 h-5 text-slate-400" />,
        color: "text-slate-400",
      };
    } else if (rank === 3) {
      return {
        icon: <Award className="fill-amber-700 w-5 h-5 text-amber-700" />,
        color: "text-amber-700",
      };
    }

    return {
      icon: <span className="font-medium text-sm">{rank}</span>,
      color: "text-muted-foreground",
    };
  };

  // Precompute user-related data
  const isUserInTop = leaderboard
    .slice(0, 10)
    .some((item) => item.userId === user?._id);
  const userRankEntry =
    !isUserInTop && user
      ? leaderboard.find((item) => item.userId === user._id)
      : null;

  return (
    <Card>
      <CardHeader className="relative">
        <CardTitle className="text-center">EpicTasks Leaderboard</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-end mb-4">
          <Button onClick={refreshLeaderboard} variant="outline" size="sm">
            <RefreshCw className="mr-2 w-4 h-4" />
            Refresh
          </Button>
        </div>
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
              const isCurrentUser = entry.userId === user?._id;
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
                          src={entry.avatarUrl|| ""}
                          alt={entry.username || ""}
                        />
                        <AvatarFallback>
                          {(entry.username ?? "").substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className={isCurrentUser ? "font-bold" : ""}>
                        {entry.username} {isCurrentUser && "(You)"}
                      </span>
                    </div>
                  </TableCell>                  <TableCell className="font-medium text-right">
                    {Math.floor(entry.xp / 100) + 1} {/* Calculate level based on XP */}
                  </TableCell>
                  <TableCell className="font-medium text-right">
                    {entry.xp || 0} {/* Hiển thị 0 nếu không có xp */}
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
                          src={userRankEntry.avatarUrl || ""}
                          alt={userRankEntry.username || ""}
                        />
                        <AvatarFallback>
                          {(userRankEntry.username ?? "").substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-bold">
                        {userRankEntry.username} (You)
                      </span>
                    </div>
                  </TableCell>                  
                  <TableCell className="font-medium text-right">
                    {Math.floor(userRankEntry.xp / 100) + 1} {/* Calculate level based on XP */}
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
