import React from "react";
import { Badge } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge as BadgeUI } from "@/components/ui/badge";

interface BadgeCardProps {
  badge: Badge;
}

const BadgeCard: React.FC<BadgeCardProps> = ({ badge }) => {
  // Xác định thông tin hiển thị dựa trên loại milestone
  

  return (
    <Card className={`overflow-hidden ${!badge.unlockedAt ? 'opacity-60' : ''}`}>
      <CardContent className="flex flex-col items-center p-4 text-center">
        <div className="mb-2 text-4xl">{badge.icon}</div>
        <h3 className="font-bold">{badge.title}</h3>
        <p className="text-muted-foreground text-sm">{badge.description}</p>
        <div className="mt-2">
          <BadgeUI variant={badge.unlockedAt ? "default" : "outline"}>
            {badge.unlockedAt ? 'Unlocked' : 'Locked'}
          </BadgeUI>
        </div>
      </CardContent>
    </Card>
  );
};

export default BadgeCard;
