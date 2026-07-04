import React from 'react';
import { Outlet } from 'react-router-dom';
import ClinicSidebar from './ClinicSidebar';
import { TopNav } from '../../../components/layout/TopNav';

const ClinicLayout = () => {
  return (
    <div className="flex min-h-screen bg-background font-sans text-textPrimary">
      <ClinicSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav />
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ClinicLayout;
