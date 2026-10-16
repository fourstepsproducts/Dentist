import React, { useContext } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Force password change for staff
  if (user.mustChangePassword && location.pathname !== '/clinic/profile') {
    return <Navigate to="/clinic/profile" replace />;
  }

  const userRole = (user.role || '').toLowerCase();

  if (allowedRoles && allowedRoles.length > 0) {
    if (allowedRoles.includes('clinic_all')) {
      if (userRole === 'admin') {
        // Admin allowed
      } else if (userRole === 'inventory') {
        return <Navigate to="/unauthorized" replace />;
      } else {
        // All other clinic/staff roles allowed
      }
    } else {
      const normalizedAllowed = allowedRoles.map(r => r.toLowerCase());
      if (!normalizedAllowed.includes(userRole)) {
        return <Navigate to="/unauthorized" replace />;
      }
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
