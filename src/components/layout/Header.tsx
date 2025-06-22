import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

const Header: React.FC = () => {
  const { user, isLoading } = useAuth();

  if ( isLoading || !user) return null;

  const displayName = user.username
    ? `${user.username}`
    : `${user.first_name || ""} ${user.last_name || ""}`.trim();

  return (
    <header className="top-0 z-10 sticky bg-background/80 shadow-sm backdrop-blur-sm">
      <div className="mx-auto px-4 py-3 container">
        {/* Name project */}
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <span className="bg-clip-text bg-gradient-to-r from-epic-purple to-epic-blue font-bold text-2xl">
              EpicTasks
            </span>
          </Link>

          <div className="flex items-center space-x-3">
            <Link
              to="/profile"
              className="flex items-center hover:bg-accent border border-accent rounded-xl"
            >
              <Avatar className="relative mr-2 w-10 h-10">
                <AvatarImage
                  src={user.avatar || "https://i.pravatar.cc/100"}
                  alt="user avatar"
                />
                <AvatarFallback>{displayName.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-base leading-none">
                  {displayName}
                </p>
                <p className="text-muted-foreground text-xs leading-none">
                  Level {user.level}
                </p>
              </div>
            </Link>
          </div>
        </div>

        <div className="mt-2 w-full">
          <div className="bg-muted rounded-full w-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-epic-blue to-epic-purple h-full"
              style={{
                width: `${((user.xp % 100) / 100) * 100}%`,
              }}
            ></div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
