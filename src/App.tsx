import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import AppLayout from "./components/layout/AppLayout";
import HomePage from "./pages/HomePage";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ProfilePage from "./pages/ProfilePage";
import DailyPage from "./pages/DailyPage";
import BadgesPage from "./pages/BadgesPage";
import TasksPage from "./pages/TasksPage";
import LeaderboardPage from "./pages/LeaderboardPage";
// import NotificationsPage from "./pages/NotificationsPage";
import StorePage from "./pages/StorePage";

import { TaskProvider } from "./contexts/TaskContext";
import { AuthProvider } from "./contexts/AuthContext";
import { LeaderboardProvider } from "./contexts/LeaderboardContext";
import { BadgeProvider } from "./contexts/BadgeContext";

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <BadgeProvider>
        <TaskProvider>
          <LeaderboardProvider>
  
              <Toaster />
              <Routes>
                <Route path="/" element={<AppLayout />}>
                  <Route index element={<Index />} />
                  <Route path="home" element={<HomePage />} />
                  <Route path="tasks" element={<TasksPage />} />
                  <Route path="badges" element={<BadgesPage />} />
                  <Route path="leaderboard" element={<LeaderboardPage />} />
                  {/* <Route
                    path="notifications"
                    element={<NotificationsPage />}
                  /> */}
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="daily" element={<DailyPage />} />
                  <Route path="store" element={<StorePage />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
          </LeaderboardProvider>
        </TaskProvider>
      </BadgeProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
