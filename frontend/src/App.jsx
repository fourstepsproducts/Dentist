import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import InventoryDashboard from './pages/InventoryDashboard';
import Unauthorized from './pages/Unauthorized';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

// Admin Pages
import ClinicalUsers from './pages/admin/ClinicalUsers';
import InventoryUsers from './pages/admin/InventoryUsers';
import StaffManagement from './pages/admin/StaffManagement';
import DoctorManagement from './pages/admin/DoctorManagement';
import LabManagement from './pages/admin/LabManagement';
import FinancialReports from './pages/admin/FinancialReports';

// Clinic Portal Pages

import DynamicDashboard from './pages/clinic/pages/DynamicDashboard';
import PatientRecords from './pages/clinic/pages/PatientRecords';
import ChiefComplaint from './pages/clinic/pages/ChiefComplaint';
import DiagnosisTreatment from './pages/clinic/pages/DiagnosisTreatment';
import TreatmentRecords from './pages/clinic/pages/TreatmentRecords';
import Appointments from './pages/clinic/pages/Appointments';
import Documents from './pages/clinic/pages/Documents';
import Profile from './pages/clinic/pages/Profile';
import Settings from './pages/clinic/pages/Settings';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Authenticated Routes with Global Layout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          
          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/clinical-users" element={<ClinicalUsers />} />
            <Route path="/admin/inventory-users" element={<InventoryUsers />} />
            <Route path="/admin/staff" element={<StaffManagement />} />
            <Route path="/admin/doctors" element={<DoctorManagement />} />
            <Route path="/admin/labs" element={<LabManagement />} />
            <Route path="/admin/financial-reports" element={<FinancialReports />} />
          </Route>

          {/* Clinic Portal Routes */}
          <Route element={<ProtectedRoute allowedRoles={['clinic_all']} />}>
            <Route path="/clinic/dashboard" element={<DynamicDashboard />} />
            <Route path="/clinic/patient-records" element={<PatientRecords />} />
            <Route path="/clinic/chief-complaint" element={<ChiefComplaint />} />
            <Route path="/clinic/diagnosis-treatment" element={<DiagnosisTreatment />} />
            <Route path="/clinic/treatment-records" element={<TreatmentRecords />} />
            <Route path="/clinic/appointments" element={<Appointments />} />
            <Route path="/clinic/documents" element={<Documents />} />
            <Route path="/clinic/profile" element={<Profile />} />
            <Route path="/clinic/settings" element={<Settings />} />
          </Route>

          {/* Inventory Routes */}
          <Route element={<ProtectedRoute allowedRoles={['inventory']} />}>
            <Route path="/inventory/dashboard" element={<InventoryDashboard />} />
          </Route>

        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
