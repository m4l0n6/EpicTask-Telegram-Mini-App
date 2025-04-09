import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import HomePage from "./pages/HomePage";
import NotFound from "./pages/NotFound";
import ProfilePage from "./pages/ProfilePage";

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="tasks" element={<div>Tasks</div>} />
        <Route path="badges" element={<div>Badges</div>} />
        <Route path="leaderboard" element={<div>Leaderboard</div>} />
        <Route path="notifications" element={<div>notifications</div>} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="daily" element={<div>daily</div>} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

export default App;
