import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';

// This wrapper handles the Sidebar + Topnav layout for authenticated routes
const AppLayout = () => {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <TopNav />
        <div className="p-4" style={{ overflowY: 'auto' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
