import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
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

// Inventory Panel Pages & Context
import { InventoryProvider } from './context/InventoryContext';
import InventoryDashboard from './pages/inventory/pages/Dashboard';
import ItemManagement from './pages/inventory/pages/ItemManagement';
import MaterialSupply from './pages/inventory/pages/MaterialSupply';
import StockManagement from './pages/inventory/pages/StockManagement';
import StockInHand from './pages/inventory/pages/StockInHand';
import MaterialRequirements from './pages/inventory/pages/MaterialRequirements';
import InventoryLabManagement from './pages/inventory/pages/LabManagement';
import MaterialInventory from './pages/inventory/pages/MaterialInventory';
import Suppliers from './pages/inventory/pages/Suppliers';
import PurchaseOrders from './pages/inventory/pages/PurchaseOrders';
import GoodsReceived from './pages/inventory/pages/GoodsReceived';
import Reports from './pages/inventory/pages/Reports';
import SummaryDashboard from './pages/inventory/pages/SummaryDashboard';
import SupplierPayments from './pages/inventory/pages/SupplierPayments';
import DuePayments from './pages/inventory/pages/DuePayments';
import Notifications from './pages/inventory/pages/Notifications';
import InventorySettings from './pages/inventory/pages/Settings';

import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
      <Toaster position="top-right" />
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
          <Route element={<ProtectedRoute allowedRoles={['inventory', 'admin']} />}>
            <Route element={
              <InventoryProvider>
                <Outlet />
              </InventoryProvider>
            }>
              <Route path="/inventory/dashboard" element={<InventoryDashboard />} />
              <Route path="/inventory/items" element={<ItemManagement />} />
              <Route path="/inventory/material-supply" element={<MaterialSupply />} />
              <Route path="/inventory/stock" element={<StockManagement />} />
              <Route path="/inventory/stock-in-hand" element={<StockInHand />} />
              <Route path="/inventory/requirements" element={<MaterialRequirements />} />
              <Route path="/inventory/labs" element={<InventoryLabManagement />} />
              <Route path="/inventory/material-inventory" element={<MaterialInventory />} />
              <Route path="/inventory/suppliers" element={<Suppliers />} />
              <Route path="/inventory/purchase-orders" element={<PurchaseOrders />} />
              <Route path="/inventory/goods-received" element={<GoodsReceived />} />
              <Route path="/inventory/reports" element={<Reports />} />
              <Route path="/inventory/summary" element={<SummaryDashboard />} />
              <Route path="/inventory/payments" element={<SupplierPayments />} />
              <Route path="/inventory/due-payments" element={<DuePayments />} />
              <Route path="/inventory/notifications" element={<Notifications />} />
              <Route path="/inventory/settings" element={<InventorySettings />} />
            </Route>
          </Route>

        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
    </>
  );
}

export default App;
