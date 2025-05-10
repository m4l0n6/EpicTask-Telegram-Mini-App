import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Badge as BadgeType } from "@/types";
import { badgeApi } from "@/services/api";
import { toast } from "@/hooks/use-toast";

// Định nghĩa kiểu dữ liệu cho badge từ API
interface APIBadge {
  _id: string;
  title: string;
  description: string;
  icon: string;
  milestoneType?: string;
  milestoneValue?: number;
}

interface UserBadge {
  _id: string;
  title: string;
  description: string;
  icon: string;
  receivedAt: string;
}

// Thêm các kiểu huy hiệu theo nhóm
interface BadgesByType {
  tasksCompleted: BadgeType[];
  levelReached: BadgeType[];
  other: BadgeType[];
}

interface BadgeContextType {
  badges: BadgeType[];
  unlockedBadges: BadgeType[];
  lockedBadges: BadgeType[];
  badgesByType: BadgesByType;
  isLoading: boolean;
  refreshBadges: () => Promise<void>;
}

const BadgeContext = createContext<BadgeContextType | undefined>(undefined);

export const BadgeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [badges, setBadges] = useState<BadgeType[]>([]);
  const [unlockedBadges, setUnlockedBadges] = useState<BadgeType[]>([]);
  const [lockedBadges, setLockedBadges] = useState<BadgeType[]>([]);
  const [badgesByType, setBadgesByType] = useState<BadgesByType>({
    tasksCompleted: [],
    levelReached: [],
    other: []
  });
  const [isLoading, setIsLoading] = useState(true);

  const refreshBadges = async () => {
    try {
      setIsLoading(true);
      // Lấy tất cả huy hiệu từ hệ thống
      const allBadges = await badgeApi.getAllBadges() as APIBadge[];
      
      // Lấy thông tin người dùng, bao gồm badges đã mở khóa
      // API trả về mảng badges từ endpoint /users/me
      const userProfile = await badgeApi.getUserBadges();
      const userBadges = userProfile; // userProfile đã là mảng badges
      
      console.log("All Badges:", allBadges);
      console.log("User Badges:", userBadges);
      
      // Định dạng đối tượng Badge cho frontend
      const processedBadges = allBadges.map((badge) => {
        // Kiểm tra xem người dùng đã mở khóa huy hiệu này chưa
        // Dựa vào file controllers/userController.js, dữ liệu trả về có cấu trúc khác
        const userHasBadge = userBadges.some(
          (userBadge: UserBadge) => userBadge._id === badge._id
        );
        
        return {
          _id: badge._id,
          title: badge.title,
          description: badge.description,
          icon: badge.icon || "🏆",
          milestoneType: badge.milestoneType,
          milestoneValue: badge.milestoneValue,
          unlockedAt: userHasBadge ? new Date().toISOString() : null
        };
      });
      
      // Set badges như bình thường
      setBadges(processedBadges as unknown as BadgeType[]); 
      setUnlockedBadges(processedBadges.filter(badge => badge.unlockedAt !== null) as unknown as BadgeType[]);
      setLockedBadges(processedBadges.filter(badge => badge.unlockedAt === null) as unknown as BadgeType[]);
      
      // Thêm: phân loại badges theo milestoneType
      const tasksBadges = processedBadges.filter(badge => badge.milestoneType === 'tasksCompleted') as unknown as BadgeType[];
      const levelBadges = processedBadges.filter(badge => badge.milestoneType === 'levelReached') as unknown as BadgeType[];
      const otherBadges = processedBadges.filter(badge => 
        !badge.milestoneType || 
        (badge.milestoneType !== 'tasksCompleted' && badge.milestoneType !== 'levelReached')
      ) as unknown as BadgeType[];
      
      // Sắp xếp theo giá trị milestone (từ thấp đến cao)
      tasksBadges.sort((a, b) => (a.milestoneValue || 0) - (b.milestoneValue || 0));
      levelBadges.sort((a, b) => (a.milestoneValue || 0) - (b.milestoneValue || 0));
      
      setBadgesByType({
        tasksCompleted: tasksBadges,
        levelReached: levelBadges,
        other: otherBadges
      });
      
    } catch (error) {
      console.error("Error fetching badges:", error);
      toast({
        title: "Error",
        description: "Failed to load badges",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshBadges();
  }, []);

  useEffect(() => {
    // Lắng nghe sự kiện badge unlocked từ socket
    const handleBadgeUnlocked = () => {
      refreshBadges();
    };
    
    document.addEventListener('badgeUnlocked', handleBadgeUnlocked);
    
    // Cleanup
    return () => {
      document.removeEventListener('badgeUnlocked', handleBadgeUnlocked);
    };
  }, []);

  return (
    <BadgeContext.Provider
      value={{
        badges,
        unlockedBadges,
        lockedBadges,
        badgesByType,  // Thêm vào context
        isLoading,
        refreshBadges
      }}
    >
      {children}
    </BadgeContext.Provider>
  );
};

// Định nghĩa useBadge ở bên ngoài component để tránh cảnh báo Fast Refresh
export function useBadge() {
  const context = useContext(BadgeContext);
  if (context === undefined) {
    throw new Error("useBadge must be used within a BadgeProvider");
  }
  return context;
}