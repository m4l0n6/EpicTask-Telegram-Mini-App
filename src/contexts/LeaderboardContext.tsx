import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Leaderboard } from "@/types";
import { leaderboardApi } from "@/services/api";
import { useAuth } from "./AuthContext";

export interface LeaderboardContextType {
  leaderboard: Leaderboard[];
  userRank: number | null;
  isLoading: boolean;
  refreshLeaderboard: () => void;
}

export const LeaderboardContext = createContext<LeaderboardContextType | undefined>(undefined);

export const LeaderboardProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [leaderboard, setLeaderboard] = useState<Leaderboard[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadLeaderboard();
    } else {
      setLeaderboard([]);
      setIsLoading(false);
    }
  }, [user]);
  const loadLeaderboard = async () => {
    setIsLoading(true);
    try {
      const rawLeaderboardData = await leaderboardApi.getLeaderboard();
        // Map the backend data structure to our frontend Leaderboard type
      const formattedLeaderboard = rawLeaderboardData.map((entry: {
        userId: string;
        username: string;
        avatar?: string;
        score?: number;
        rank: number;
      }) => ({
        userId: entry.userId,
        username: entry.username,
        avatarUrl: entry.avatar, // Map avatar to avatarUrl
        xp: entry.score || 0,    // Map score to xp
        level: Math.floor((entry.score || 0) / 100) + 1, // Calculate level based on XP
        rank: entry.rank
      }));
      
      setLeaderboard(formattedLeaderboard);
    } catch (error) {
      console.error("Failed to load leaderboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshLeaderboard = () => {
    loadLeaderboard();
  };

  // Calculate user's rank
  const userRank = user
    ? leaderboard.find((item) => item.userId === user._id)?.rank || null
    : null;

  return (
    <LeaderboardContext.Provider
      value={{
        leaderboard,
        userRank,
        isLoading,
        refreshLeaderboard,
      }}
    >
      {children}
    </LeaderboardContext.Provider>
  );
};

// useLeaderboard hook has been moved to src/hooks/useLeaderboard.ts
