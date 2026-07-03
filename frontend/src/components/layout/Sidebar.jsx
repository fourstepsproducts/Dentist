import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, Package, Settings, Stethoscope, Activity } from 'lucide-react';
import { cn } from '../../lib/utils';

const Sidebar = ({ role }) => {
  const getLinks = () => {
    switch (role) {
      case 'admin':
        return [
          { name: 'Dashboard', path: '/admin/dashboard', icon: Home },
          { name: 'Staff Management', path: '/admin/staff', icon: Users },
          { name: 'Doctor Management', path: '/admin/doctors', icon: Stethoscope },
          { name: 'Lab Management', path: '/admin/labs', icon: Package },
          { name: 'Financial Reports', path: '/admin/financial-reports', icon: Activity },
          { name: 'Settings', path: '/admin/settings', icon: Settings },
        ];
      case 'clinical':
        return [
          { name: 'Dashboard', path: '/clinical/dashboard', icon: Home },
          { name: 'Patients', path: '/clinical/patients', icon: Users },
        ];
      case 'inventory':
        return [
          { name: 'Dashboard', path: '/inventory/dashboard', icon: Home },
          { name: 'Stock', path: '/inventory/stock', icon: Package },
        ];
      default:
        return [];
    }
  };

  const links = getLinks();

  return (
    <div className="flex flex-col w-64 bg-surface border-r border-border min-h-screen">
      <div className="h-16 flex items-center px-6 border-b border-border">
        <Stethoscope className="w-6 h-6 text-primary mr-2" />
        <span className="font-bold text-lg text-textPrimary tracking-tight">Oasis Dental</span>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            className={({ isActive }) =>
              cn(
                'flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-textSecondary hover:bg-muted hover:text-textPrimary'
              )
            }
          >
            <link.icon className="w-5 h-5 mr-3" />
            {link.name}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export { Sidebar };
