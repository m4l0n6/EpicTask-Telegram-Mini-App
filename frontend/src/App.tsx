import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import HomePage from "./pages/HomePage";
import NotFound from "./pages/NotFound";
import ProfilePage from "./pages/ProfilePage";
import DailyPage from "./pages/DailyPage";
import BadgesPage from "./pages/BadgesPage";
import TasksPage from "./pages/TasksPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import NotificationsPage from "./pages/NotificationsPage";
import StorePage from "./pages/StorePage";
import ApiTest from '@/pages/ApiTest';

import { TaskProvider } from "./contexts/TaskContext";

const App = () => (
  <BrowserRouter>
    <TaskProvider>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="badges" element={<BadgesPage />} />
          <Route path="leaderboard" element={<LeaderboardPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="daily" element={<DailyPage />} />
          <Route path="store" element={<StorePage />} />
          <Route path="api-test" element={<ApiTest />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TaskProvider>
  </BrowserRouter>
);

export default App;
