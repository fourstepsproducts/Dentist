import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { LogOut, User, Bell } from 'lucide-react';
import { Button } from '../ui/Button';

const TopNav = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="flex items-center">
        {/* Placeholder for Breadcrumbs or Search */}
        <span className="text-sm font-medium text-textSecondary uppercase tracking-wider">
          {user?.role} Portal
        </span>
      </div>
      <div className="flex items-center space-x-4">
        <button className="text-textSecondary hover:text-textPrimary transition-colors">
          <Bell size={20} />
        </button>
        <div className="h-8 w-px bg-border mx-2"></div>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <User size={16} />
          </div>
          <span className="text-sm font-medium text-textPrimary">{user?.name || 'User'}</span>
          <Button variant="ghost" size="icon" onClick={logout} title="Logout" className="ml-2 text-textSecondary hover:text-danger hover:bg-danger/10">
            <LogOut size={18} />
          </Button>
        </div>
      </div>
    </header>
  );
};

export { TopNav };
