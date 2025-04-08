import React from "react";
import Header from "./Header";
import Footer from "./Footer";

import { Outlet } from "react-router-dom";

const AppLayout: React.FC = () => {
    return (
      <div className="flex flex-col bg-gradient-to-br from-background to-background/70 min-h-screen">
        <Header />
        <main className="flex-grow mx-auto px-4 py-6 pb-20 container">
          <Outlet />
        </main>
        <Footer />
      </div>
    );
    
}

export default AppLayout;