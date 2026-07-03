import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import ClinicalDashboard from './pages/ClinicalDashboard';
import InventoryDashboard from './pages/InventoryDashboard';
import Unauthorized from './pages/Unauthorized';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

import ClinicalUsers from './pages/admin/ClinicalUsers';
import InventoryUsers from './pages/admin/InventoryUsers';
import StaffManagement from './pages/admin/StaffManagement';
import DoctorManagement from './pages/admin/DoctorManagement';
import LabManagement from './pages/admin/LabManagement';
import FinancialReports from './pages/admin/FinancialReports';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/clinical-users" element={<ClinicalUsers />} />
          <Route path="/admin/inventory-users" element={<InventoryUsers />} />
          
          <Route path="/admin/staff" element={<StaffManagement />} />
          <Route path="/admin/doctors" element={<DoctorManagement />} />
          <Route path="/admin/labs" element={<LabManagement />} />
          <Route path="/admin/financial-reports" element={<FinancialReports />} />
        </Route>
      </Route>

      {/* Clinical Routes */}
      <Route element={<ProtectedRoute allowedRoles={['clinical']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/clinical/dashboard" element={<ClinicalDashboard />} />
        </Route>
      </Route>

      {/* Inventory Routes */}
      <Route element={<ProtectedRoute allowedRoles={['inventory']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/inventory/dashboard" element={<InventoryDashboard />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
