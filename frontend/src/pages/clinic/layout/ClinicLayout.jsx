import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import ClinicSidebar from './ClinicSidebar';
import { TopNav } from '../../../components/layout/TopNav';

const ClinicLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex min-h-screen bg-background font-sans text-textPrimary relative overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar with responsiveness classes */}
      <div className={`
        fixed inset-y-0 left-0 z-50 lg:static lg:z-auto transition-transform duration-300 ease-in-out min-h-screen shrink-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <ClinicSidebar closeSidebar={closeSidebar} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <TopNav toggleSidebar={toggleSidebar} />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ClinicLayout;
