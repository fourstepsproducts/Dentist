import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, Users, Package, Settings, Stethoscope, Activity, 
  ChevronDown, ChevronRight, LayoutDashboard, FileText, 
  ClipboardList, Calendar, UploadCloud, User 
} from 'lucide-react';
import { cn } from '../../lib/utils';

const Sidebar = ({ role }) => {
  const [isClinicExpanded, setIsClinicExpanded] = useState(true);

  const clinicLinks = [
    { name: 'Dashboard', path: '/clinic/dashboard', icon: LayoutDashboard },
    { name: 'Patient Records', path: '/clinic/patient-records', icon: Users },
    { name: 'Chief Complaint', path: '/clinic/chief-complaint', icon: FileText },
    { name: 'Diagnosis & Treatment', path: '/clinic/diagnosis-treatment', icon: Activity },
    { name: 'Treatment Records', path: '/clinic/treatment-records', icon: ClipboardList },
    { name: 'Appointments', path: '/clinic/appointments', icon: Calendar },
    { name: 'Document Upload', path: '/clinic/documents', icon: UploadCloud },
    { name: 'Profile', path: '/clinic/profile', icon: User },
  ];

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
      case 'inventory':
        return [
          { name: 'Dashboard', path: '/inventory/dashboard', icon: Home },
          { name: 'Stock', path: '/inventory/stock', icon: Package },
        ];
      default:
        // Render clinicLinks for all other clinic staff (doctor, nurse, receptionist, etc.)
        return clinicLinks;
    }
  };

  const links = getLinks();

  return (
    <div className="flex flex-col w-64 bg-surface border-r border-border min-h-screen">
      <div className="h-16 flex items-center px-6 border-b border-border shrink-0">
        <Stethoscope className="w-6 h-6 text-primary mr-2" />
        <span className="font-bold text-lg text-textPrimary tracking-tight">Oasis Dental</span>
      </div>
      <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-4">
        
        {/* Main Section */}
        <div className="space-y-1">
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
              <link.icon className="w-5 h-5 mr-3 shrink-0" />
              <span className="truncate">{link.name}</span>
            </NavLink>
          ))}
        </div>

        {/* Expandable Clinic Section (For Admins) */}
        {role === 'admin' && (
          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={() => setIsClinicExpanded(!isClinicExpanded)}
              className="w-full flex items-center justify-between px-3 py-2 text-sm font-bold text-slate-400 uppercase tracking-wider hover:text-slate-600 transition-colors focus:outline-none"
            >
              <span>Clinic</span>
              {isClinicExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            
            <div 
              className={cn(
                "mt-2 space-y-1 overflow-hidden transition-all duration-300 ease-in-out",
                isClinicExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
              )}
            >
              {clinicLinks.map((link) => (
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
                  <link.icon className="w-5 h-5 mr-3 shrink-0" />
                  <span className="truncate">{link.name}</span>
                </NavLink>
              ))}
            </div>
          </div>
        )}

      </nav>
    </div>
  );
};

export { Sidebar };
