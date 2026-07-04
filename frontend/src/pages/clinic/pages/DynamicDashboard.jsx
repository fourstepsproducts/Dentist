import React, { useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { Card } from '../../../components/ui/Card';

const DynamicDashboard = () => {
  const { user } = useContext(AuthContext);

  const renderDashboardContent = () => {
    switch (user?.role?.toLowerCase()) {
      case 'doctor':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-2">Today's Appointments</h3>
              <p className="text-4xl font-bold text-blue-600">8</p>
            </Card>
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-2">Patient Queue</h3>
              <p className="text-4xl font-bold text-indigo-600">3</p>
            </Card>
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-2">Lab Reports Ready</h3>
              <p className="text-4xl font-bold text-emerald-600">2</p>
            </Card>
            <div className="col-span-1 md:col-span-2 lg:col-span-3 mt-4">
              <Card className="p-6 h-64 flex items-center justify-center text-slate-400">
                [Doctor Dashboard Widgets Under Construction]
              </Card>
            </div>
          </div>
        );
      case 'nurse':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-2">Assigned Patients</h3>
              <p className="text-4xl font-bold text-teal-600">12</p>
            </Card>
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-2">Vitals Queue</h3>
              <p className="text-4xl font-bold text-orange-500">4</p>
            </Card>
            <div className="col-span-1 md:col-span-2 lg:col-span-3 mt-4">
              <Card className="p-6 h-64 flex items-center justify-center text-slate-400">
                [Nurse Dashboard Widgets Under Construction]
              </Card>
            </div>
          </div>
        );
      case 'receptionist':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-2">Check-in Queue</h3>
              <p className="text-4xl font-bold text-purple-600">5</p>
            </Card>
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-2">Pending Billing</h3>
              <p className="text-4xl font-bold text-rose-500">2</p>
            </Card>
            <div className="col-span-1 md:col-span-2 lg:col-span-3 mt-4">
              <Card className="p-6 h-64 flex items-center justify-center text-slate-400">
                [Receptionist Dashboard Widgets Under Construction]
              </Card>
            </div>
          </div>
        );
      case 'lab staff':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-2">Pending Tests</h3>
              <p className="text-4xl font-bold text-amber-600">15</p>
            </Card>
            <div className="col-span-1 md:col-span-2 lg:col-span-3 mt-4">
              <Card className="p-6 h-64 flex items-center justify-center text-slate-400">
                [Lab Staff Dashboard Widgets Under Construction]
              </Card>
            </div>
          </div>
        );
      case 'pharmacist':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-2">Pending Prescriptions</h3>
              <p className="text-4xl font-bold text-green-600">7</p>
            </Card>
            <div className="col-span-1 md:col-span-2 lg:col-span-3 mt-4">
              <Card className="p-6 h-64 flex items-center justify-center text-slate-400">
                [Pharmacist Dashboard Widgets Under Construction]
              </Card>
            </div>
          </div>
        );
      default:
        return (
          <Card className="p-8 text-center text-slate-500">
            <p className="text-lg font-medium">Welcome, {user?.name}</p>
            <p className="mt-2">Your role is: <span className="font-bold text-slate-700">{user?.role}</span></p>
            <p className="mt-4">Your role-specific dashboard is being prepared.</p>
          </Card>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Welcome back, {user?.name}. Here's what's happening today.</p>
      </div>
      
      {renderDashboardContent()}
    </div>
  );
};

export default DynamicDashboard;
