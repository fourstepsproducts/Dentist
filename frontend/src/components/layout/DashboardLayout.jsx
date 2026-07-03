import React, { useContext } from 'react';
import { Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';

const DashboardLayout = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="flex min-h-screen bg-background font-sans text-textPrimary">
      <Sidebar role={user?.role} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav />
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
