import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Bell, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

const Header: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;
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
            <div className="flex items-center">
              <Link
                to="/store"
                className="flex items-center bg-epic-yellow/10 hover:bg-epic-yellow/20 px-3 py-1 border-epic-yellow/30 rounded-full"
              >
                <img src="../token.png" alt="" className="mr-2 w-8 h-8" />
                <span className="font-medium text-stone-950">100</span>
              </Link>
            </div>

            <Link
              to="/notifications"
              className="relative hover:bg-accent p-2 rounded-full"
            >
              <Bell className="w-5 h-5" />
              <span className="top-0 right-0 absolute flex justify-center items-center bg-epic-blue rounded-full w-4 h-4 text-[10px] text-white">
                10
              </span>
            </Link>

            <Link to="/daily" className="hover:bg-accent p-2 rounded-full">
              <Calendar className="w-5 h-5" />
            </Link>

            <Link to="profile">
              <div className="flex items-center space-x-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage
                    src={user.avatar}
                    alt="User Avatar" 
                  />
                  <AvatarFallback className="bg-epic-blue rounded-full text-white">
                    <span className="text-sm">U</span>
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col">
                  <span className="font-medium text-gray-800 text-sm">
                    {user.username}
                  </span>
                  <span className="text-gray-500 text-xs">
                    Level {user.level}
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Quá trình */}
        <div className="mt-2 w-full">
          <div className="bg-muted rounded-full w-full h-1 overflow-hidden">
            <div
              className="bg-gradient-to-r from-epic-purple to-epic-blue h-full duration-300 ease-in-out"
              style={{ width: `30%` }}
            ></div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
