import React from "react";
import { useBadge } from "@/contexts/BadgeContext";
import BadgeCard from "./BadgeCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Loading from "../ui/Loading";
import { Separator } from "@/components/ui/separator";

const BadgeList: React.FC = () => {
  const { unlockedBadges, lockedBadges, badgesByType, isLoading } = useBadge();

  if (isLoading) {
    return <Loading message="Loading badges..." />;
  }

  return (
    <div>
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="all">All Badges</TabsTrigger>
          <TabsTrigger value="unlocked">
            Unlocked ({unlockedBadges.length})
          </TabsTrigger>
          <TabsTrigger value="locked">
            Locked ({lockedBadges.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          {/* Hiển thị theo nhóm */}
          <div className="mb-6">
            <h3 className="mb-2 font-medium text-lg">Tasks Badges</h3>
            <Separator className="my-2" />
            <div className="gap-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
              {badgesByType.tasksCompleted.map((badge) => (
                <BadgeCard key={badge._id} badge={badge} />
              ))}
              {badgesByType.tasksCompleted.length === 0 && (
                <div className="col-span-full py-4 text-muted-foreground text-center">
                  No task badges available.
                </div>
              )}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="mb-2 font-medium text-lg">Level Badges</h3>
            <Separator className="my-2" />
            <div className="gap-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
              {badgesByType.levelReached.map((badge) => (
                <BadgeCard key={badge._id} badge={badge} />
              ))}
              {badgesByType.levelReached.length === 0 && (
                <div className="col-span-full py-4 text-muted-foreground text-center">
                  No level badges available.
                </div>
              )}
            </div>
          </div>

          {badgesByType.other.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-2 font-medium text-lg">Other Badges</h3>
              <Separator className="my-2" />
              <div className="gap-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
                {badgesByType.other.map((badge) => (
                  <BadgeCard key={badge._id} badge={badge} />
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Giữ nguyên tab Unlocked và Locked */}
        <TabsContent value="unlocked" className="mt-4">
          {unlockedBadges.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-muted-foreground">
                Complete tasks to unlock badges
              </p>
            </div>
          ) : (
            <div className="gap-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
              {unlockedBadges.map((badge) => (
                <BadgeCard key={badge._id} badge={badge} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="locked" className="mt-4">
          <div className="gap-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            {lockedBadges.map((badge) => (
              <BadgeCard key={badge._id} badge={badge} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BadgeList;
