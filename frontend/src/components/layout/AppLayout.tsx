import React from "react";
import Header from "./Header";
import { useAuth } from "@/contexts/AuthContext";
import Footer from "./Footer";
import Loading from "../ui/Loading";

import LoginPage from "@/pages/LoginPage";

import { Outlet } from "react-router-dom";

const AppLayout: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <Loading message="Loading EpicTasks..." />;
  }

  if (!user) {
    return <LoginPage />;
  }

    return (
      <div className="relative flex flex-col bg-gradient-to-br from-background to-background/70 min-h-screen">
        <Header />
        <main className="flex-grow mx-auto px-4 py-6 pb-20 container">
          <Outlet />
        </main>
        <Footer />
      </div>
    );
    
}

export default AppLayout;