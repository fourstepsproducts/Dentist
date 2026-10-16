import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, ClipboardList, Activity, Calendar, UploadCloud, User, Settings, LogOut, Stethoscope } from 'lucide-react';
import { cn } from '../../../lib/utils';

const isRouteActive = (linkPath, currentPath) => {
  if (!currentPath || !linkPath) return false;
  if (currentPath === linkPath) return true;

  if (linkPath === '/clinic/appointments') {
    if (currentPath === '/clinic/queue' || currentPath.startsWith('/clinic/queue')) {
      return true;
    }
  }

  if (linkPath === '/clinic/diagnosis-treatment') {
    if (
      currentPath === '/clinic/clinical-visits' || 
      currentPath.startsWith('/clinic/clinical-visits') || 
      currentPath.startsWith('/clinic/diagnosis-treatment')
    ) {
      return true;
    }
  }

  if (currentPath.startsWith(`${linkPath}/`)) {
    return true;
  }

  return false;
};

const ClinicSidebar = ({ closeSidebar }) => {
  const location = useLocation();

  const links = [
    { name: 'Dashboard', path: '/clinic/dashboard', icon: LayoutDashboard },
    { name: 'Patient Records', path: '/clinic/patient-records', icon: Users },
    { name: 'Appointments', path: '/clinic/appointments', icon: Calendar },
    { name: 'Clinical Visits', path: '/clinic/diagnosis-treatment', icon: Stethoscope },
    { name: 'Treatment Records', path: '/clinic/treatment-records', icon: ClipboardList },
    { name: 'Document Upload', path: '/clinic/documents', icon: UploadCloud },
    { name: 'Profile', path: '/clinic/profile', icon: User },
    { name: 'Settings', path: '/clinic/settings', icon: Settings },
  ];

  const handleLogout = () => {
    if (closeSidebar) closeSidebar();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div className="flex flex-col w-64 bg-surface border-r border-border min-h-screen">
      <div className="h-16 flex items-center px-6 border-b border-border shrink-0">
        <Stethoscope className="w-6 h-6 text-primary mr-2" />
        <span className="font-bold text-lg text-textPrimary tracking-tight">Oasis Dental</span>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-3">Clinic Portal</div>
        {links.map((link) => {
          const isActive = isRouteActive(link.path, location.pathname);

          return (
            <NavLink
              key={link.name}
              to={link.path}
              onClick={closeSidebar}
              className={cn(
                'group flex items-center px-3.5 py-2.5 text-sm rounded-xl transition-all duration-150 select-none',
                isActive
                  ? 'bg-blue-50 text-blue-600 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
              )}
            >
              <link.icon
                className={cn(
                  "w-5 h-5 mr-3 shrink-0 transition-colors",
                  isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                )}
              />
              <span className="truncate">{link.name}</span>
            </NavLink>
          );
        })}
        
        <div className="pt-8 mt-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-md text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3 shrink-0" />
            Logout
          </button>
        </div>
      </nav>
    </div>
  );
};

export default ClinicSidebar;
