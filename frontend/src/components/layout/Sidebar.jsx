import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, Users, Package, Settings, Stethoscope, Activity, 
  LayoutDashboard, FileText, ClipboardList, Calendar, 
  UploadCloud, User, Bell, Archive, Layers, ShoppingBag, 
  FileCheck, Truck, Beaker, DollarSign, CreditCard, HelpCircle, BarChart2
} from 'lucide-react';
import { cn } from '../../lib/utils';

const Sidebar = ({ role, closeSidebar }) => {
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

  const inventoryGroups = [
    {
      title: 'Core & System',
      links: [
        { name: 'Dashboard', path: '/inventory/dashboard', icon: Home },
        { name: 'Summary Dashboard', path: '/inventory/summary', icon: BarChart2 },
      ]
    },
    {
      title: 'Inventory Control',
      links: [
        { name: 'Item Management', path: '/inventory/items', icon: Package },
        { name: 'Stock Management', path: '/inventory/stock', icon: ClipboardList },
        { name: 'Stock in Hand', path: '/inventory/stock-in-hand', icon: Archive },
        { name: 'Material & Inventory', path: '/inventory/material-inventory', icon: Layers },
      ]
    },
    {
      title: 'Supply Chain',
      links: [
        { name: 'Suppliers', path: '/inventory/suppliers', icon: Users },
        { name: 'Purchase Orders', path: '/inventory/purchase-orders', icon: ShoppingBag },
        { name: 'Goods Received', path: '/inventory/goods-received', icon: FileCheck },
        { name: 'Material Supply', path: '/inventory/material-supply', icon: Truck },
      ]
    },
    {
      title: 'Finance & Labs',
      links: [
        { name: 'Lab Management', path: '/inventory/labs', icon: Beaker },
        { name: 'Supplier Payments', path: '/inventory/payments', icon: DollarSign },
        { name: 'Due Payments', path: '/inventory/due-payments', icon: CreditCard },
        { name: 'Material Requirements', path: '/inventory/requirements', icon: HelpCircle },
        { name: 'Reports', path: '/inventory/reports', icon: FileText },
      ]
    }
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
        ];
      default:
        // Render clinicLinks for all other clinic staff (doctor, nurse, receptionist, etc.)
        return clinicLinks;
    }
  };

  const links = getLinks();

  return (
    <div className="flex flex-col w-64 bg-surface border-r border-border h-full shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-border shrink-0">
        <Stethoscope className="w-6 h-6 text-primary mr-2" />
        <span className="font-bold text-lg text-textPrimary tracking-tight">Oasis Dental</span>
      </div>
      <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-4">
        
        {role === 'inventory' ? (
          <div className="space-y-5">
            {inventoryGroups.map((group) => (
              <div key={group.title} className="space-y-1.5">
                <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {group.title}
                </span>
                <div className="space-y-0.5">
                  {group.links.map((link) => (
                    <NavLink
                      key={link.name}
                      to={link.path}
                      onClick={closeSidebar}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center px-3 py-2 text-xs font-semibold rounded-md transition-colors',
                          isActive
                            ? 'bg-primary/10 text-primary'
                            : 'text-textSecondary hover:bg-muted hover:text-textPrimary'
                        )
                      }
                    >
                      <link.icon className="w-4 h-4 mr-2.5 shrink-0" />
                      <span className="truncate">{link.name}</span>
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="space-y-1">
              {links.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  onClick={closeSidebar}
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

            {/* Clinic Section (For Admins) */}
            {role === 'admin' && (
              <>
                <div className="pt-4 border-t border-slate-100">
                  <div className="px-3 py-2 text-sm font-bold text-slate-700 uppercase tracking-wider">
                    Clinic
                  </div>
                  
                  <div className="mt-2 space-y-1">
                    {clinicLinks.map((link) => (
                      <NavLink
                        key={link.name}
                        to={link.path}
                        onClick={closeSidebar}
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

                <div className="pt-4 border-t border-slate-100">
                  <div className="px-3 py-2 text-sm font-bold text-slate-700 uppercase tracking-wider">
                    Inventory
                  </div>
                  
                  <div className="mt-2 space-y-1">
                    {inventoryGroups.flatMap(g => g.links).map((link) => (
                      <NavLink
                        key={link.name}
                        to={link.path}
                        onClick={closeSidebar}
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
              </>
            )}
          </>
        )}

      </nav>
    </div>
  );
};

export { Sidebar };
