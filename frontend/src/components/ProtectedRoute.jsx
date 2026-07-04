import React, { useContext } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>; // Could be a spinner
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Force password change for staff
  if (user.mustChangePassword && location.pathname !== '/clinic/profile') {
    return <Navigate to="/clinic/profile" replace />;
  }

  if (allowedRoles && allowedRoles.includes('clinic_all')) {
    if (user.role.toLowerCase() === 'admin') {
      // Allow admin
    } else if (!['doctor', 'nurse', 'receptionist', 'lab staff', 'pharmacist', 'cleaner', 'security', 'admin staff'].includes(user.role.toLowerCase())) {
      return <Navigate to="/unauthorized" replace />;
    }
  } else if (allowedRoles && !allowedRoles.map(r => r.toLowerCase()).includes(user.role.toLowerCase())) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
