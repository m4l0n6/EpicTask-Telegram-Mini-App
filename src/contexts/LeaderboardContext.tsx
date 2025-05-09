import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Leaderboard } from "@/types";
import { leaderboardApi } from "@/services/api";
import { useAuth } from "./AuthContext";

interface LeaderboardContextType {
  leaderboard: Leaderboard[];
  userRank: number | null;
  isLoading: boolean;
  refreshLeaderboard: () => void;
}

const LeaderboardContext = createContext<LeaderboardContextType | undefined>(
  undefined
);

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
      const leaderboardData = await leaderboardApi.getLeaderboard();
      setLeaderboard(leaderboardData);
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

export const useLeaderboard = (): LeaderboardContextType => {
  const context = useContext(LeaderboardContext);
  if (context === undefined) {
    throw new Error("useLeaderboard must be used within a LeaderboardProvider");
  }
  return context;
};
