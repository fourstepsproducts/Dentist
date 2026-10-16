import React from 'react';
import { LayoutDashboard } from 'lucide-react';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-textPrimary tracking-tight flex items-center gap-2">
          <LayoutDashboard className="w-7 h-7 text-primary" />
          Inventory Dashboard
        </h1>
        <p className="text-textSecondary text-sm mt-1">
          Overview of clinical inventory, stock levels, and supply operations.
        </p>
      </div>

      {/* Empty Dashboard Placeholder */}
      <div className="bg-surface border border-border rounded-xl p-12 text-center flex flex-col items-center justify-center min-h-[320px] shadow-sm">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
          <LayoutDashboard className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-semibold text-textPrimary">Dashboard Placeholder</h3>
        <p className="text-sm text-textSecondary max-w-md mt-2 leading-relaxed">
          Inventory metrics, statistics, and overview analytics will appear here once configured. Use the <strong className="text-textPrimary font-semibold">Add Products</strong> tab to register new stock items into the system.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
