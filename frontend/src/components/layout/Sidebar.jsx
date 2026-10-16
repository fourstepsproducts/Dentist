import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, Users, Package, Settings, Stethoscope, Activity, 
  LayoutDashboard, FileText, ClipboardList, Calendar, 
  UploadCloud, User, Bell, Archive, Layers, ShoppingBag, 
  FileCheck, Truck, Beaker, DollarSign, CreditCard, HelpCircle, BarChart2
} from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * Route-aware matching logic:
 * - /clinic/appointments and /clinic/queue map to Appointments
 * - /clinic/diagnosis-treatment and /clinic/clinical-visits map to Clinical Visits
 * - /inventory/add-products and /inventory/items map to Add Products
 * - Supports nested routes without accidental partial prefix collisions
 */
const isRouteActive = (linkPath, currentPath) => {
  if (!currentPath || !linkPath) return false;

  // Exact match
  if (currentPath === linkPath) return true;

  // 1. Appointments workflow mapping:
  // /clinic/queue directly highlights Appointments
  if (linkPath === '/clinic/appointments') {
    if (currentPath === '/clinic/queue' || currentPath.startsWith('/clinic/queue')) {
      return true;
    }
  }

  // 2. Clinical Visits mapping:
  // /clinic/diagnosis-treatment is labeled "Clinical Visits" in the UI
  if (linkPath === '/clinic/diagnosis-treatment') {
    if (
      currentPath === '/clinic/clinical-visits' || 
      currentPath.startsWith('/clinic/clinical-visits') || 
      currentPath.startsWith('/clinic/diagnosis-treatment')
    ) {
      return true;
    }
  }

  // 3. Add Products mapping for Inventory
  if (linkPath === '/inventory/add-products') {
    if (currentPath === '/inventory/items' || currentPath.startsWith('/inventory/items')) {
      return true;
    }
  }

  // 4. Nested route matching (e.g., /clinic/patient-records/123 -> /clinic/patient-records)
  if (currentPath.startsWith(`${linkPath}/`)) {
    return true;
  }

  return false;
};

const Sidebar = ({ role, closeSidebar }) => {
  const location = useLocation();

  const clinicLinks = [
    { name: 'Dashboard', path: '/clinic/dashboard', icon: LayoutDashboard },
    { name: 'Patient Records', path: '/clinic/patient-records', icon: Users },
    { name: 'Appointments', path: '/clinic/appointments', icon: Calendar },
    { name: 'Clinical Visits', path: '/clinic/diagnosis-treatment', icon: Stethoscope },
    { name: 'Treatment Records', path: '/clinic/treatment-records', icon: ClipboardList },
    { name: 'Document Upload', path: '/clinic/documents', icon: UploadCloud },
    { name: 'Profile', path: '/clinic/profile', icon: User },
  ];

  const inventoryLinks = [
    { name: 'Dashboard', path: '/inventory/dashboard', icon: LayoutDashboard },
    { name: 'Add Products', path: '/inventory/add-products', icon: Package },
  ];

  const userRole = (role || '').toLowerCase();

  const getLinks = () => {
    switch (userRole) {
      case 'admin':
        return [
          { name: 'Dashboard', path: '/admin/dashboard', icon: Home },
          { name: 'Staff Management', path: '/admin/staff', icon: Users },
          { name: 'Doctor Management', path: '/admin/doctors', icon: Stethoscope },
          { name: 'Lab Management', path: '/admin/labs', icon: Package },
          { name: 'Financial Reports', path: '/admin/financial-reports', icon: Activity },
        ];
      default:
        // Render clinicLinks for all other clinic staff (doctor, nurse, receptionist, etc.)
        return clinicLinks;
    }
  };

  const links = getLinks();

  const renderNavItem = (link) => {
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
  };

  return (
    <div className="flex flex-col w-64 bg-surface border-r border-border h-full shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-border shrink-0">
        <Stethoscope className="w-6 h-6 text-primary mr-2" />
        <span className="font-bold text-lg text-textPrimary tracking-tight">Oasis Dental</span>
      </div>
      <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-4">
        
        {userRole === 'inventory' ? (
          <div className="space-y-4">
            <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              INVENTORY
            </span>
            <div className="space-y-1">
              {inventoryLinks.map(renderNavItem)}
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-1">
              {links.map(renderNavItem)}
            </div>

            {/* Clinic Section (For Admins) */}
            {userRole === 'admin' && (
              <>
                <div className="pt-4 border-t border-slate-100">
                  <div className="px-3 py-2 text-sm font-bold text-slate-700 uppercase tracking-wider">
                    Clinic
                  </div>
                  
                  <div className="mt-2 space-y-1">
                    {clinicLinks.map(renderNavItem)}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <div className="px-3 py-2 text-sm font-bold text-slate-700 uppercase tracking-wider">
                    Inventory
                  </div>
                  
                  <div className="mt-2 space-y-1">
                    {inventoryLinks.map(renderNavItem)}
                  </div>
                </div>
              </>
            )}
          </>
        )}

      </nav>
    </div>
  );
};

export { Sidebar };
export default Sidebar;
