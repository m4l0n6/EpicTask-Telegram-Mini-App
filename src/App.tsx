import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<div>Home</div>} />
        <Route path="tasks" element={<div>Tasks</div>} />
        <Route path="badges" element={<div>Badges</div>} />
        <Route path="leaderboard" element={<div>Leaderboard</div>} />
        <Route path="notifications" element={<div>notifications</div>} />
        <Route path="profile" element={<div>profile</div>} />
        <Route path="daily" element={<div>daily</div>} />
      </Route>
      <Route path="*" element={<div>404</div>} />
    </Routes>
  </BrowserRouter>
);

export default App;
