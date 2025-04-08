import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Award, List, Trophy } from "lucide-react";

const Footer: React.FC = () => {
    const location = useLocation();
    
    const isActive = (path: string) => {
      return location.pathname === path;
    };

    const getLinkClass = (path: string) => {
      return `flex flex-col items-center p-2 ${
        isActive(path) ? "text-epic-purple" : ""
      }`;
    };

    return (
      <footer className="right-0 bottom-0 left-0 z-10 fixed bg-background shadow-md shadow-muted/20 py-2">
        <div className="mx-auto container">
          <div className="flex justify-around items-center">
            <Link to="/" className={getLinkClass("/")}>
              <Home className="w-5 h-5" />
              <span className="mt-1 text-xs">Home</span>
            </Link>
            <Link to="/tasks" className={getLinkClass("/tasks")}>
              <List className="w-5 h-5" />
              <span className="mt-1 text-xs">Tasks</span>
            </Link>
            <Link to="/badges" className={getLinkClass("/badges")}>
              <Award className="w-5 h-5" />
              <span className="mt-1 text-xs">Badges</span>
            </Link>
            <Link to="/leaderboard" className={getLinkClass("/leaderboard")}>
              <Trophy className="w-5 h-5" />
              <span className="mt-1 text-xs">Ranks</span>
            </Link>
          </div>
        </div>
      </footer>
    );
}

export default Footer;