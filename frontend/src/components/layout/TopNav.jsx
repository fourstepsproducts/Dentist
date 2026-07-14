import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { LogOut, User, Bell, Menu } from 'lucide-react';
import { Button } from '../ui/Button';

const TopNav = ({ toggleSidebar }) => {
  const { user, logout } = useContext(AuthContext);

  return (
    <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-4 md:px-8 sticky top-0 z-10 shrink-0">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger menu */}
        <button 
          onClick={toggleSidebar}
          className="lg:hidden text-textSecondary hover:text-textPrimary p-1.5 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none"
        >
          <Menu size={22} />
        </button>
        <span className="text-sm font-semibold text-textSecondary uppercase tracking-wider truncate max-w-[120px] sm:max-w-none">
          {user?.role} Portal
        </span>
      </div>
      <div className="flex items-center space-x-2 md:space-x-4">
        <button className="text-textSecondary hover:text-textPrimary transition-colors p-1">
          <Bell size={20} />
        </button>
        <div className="h-8 w-px bg-border mx-1 md:mx-2"></div>
        <div className="flex items-center space-x-2 md:space-x-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <User size={16} />
          </div>
          <span className="text-sm font-medium text-textPrimary hidden sm:inline max-w-[120px] truncate">{user?.name || 'User'}</span>
          <Button variant="ghost" size="icon" onClick={logout} title="Logout" className="text-textSecondary hover:text-danger hover:bg-danger/10 p-1">
            <LogOut size={18} />
          </Button>
        </div>
      </div>
    </header>
  );
};

export { TopNav };
