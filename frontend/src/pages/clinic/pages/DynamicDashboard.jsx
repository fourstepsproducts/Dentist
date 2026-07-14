import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Calendar, Clock } from 'lucide-react';
import { AuthContext } from '../../../context/AuthContext';
import { Card } from '../../../components/ui/Card';

const DynamicDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    waitingPatients: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/clinic-dashboard/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data);
        setError(null);
      } catch (err) {
        console.error('Failed to load clinic stats', err);
        setError(err.response?.data?.message || 'Error loading dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

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

      {/* Summary Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6 h-28 bg-white flex items-center justify-between animate-pulse">
              <div className="space-y-3 flex-1">
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                <div className="h-8 bg-slate-300 rounded w-1/4"></div>
              </div>
              <div className="w-12 h-12 bg-slate-200 rounded-lg"></div>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3 text-sm">
          <span className="font-semibold">Failed to load statistics:</span> {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 transition-all hover:shadow-md duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Patients</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-2">{stats.totalPatients ?? 0}</h3>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                <Users size={22} />
              </div>
            </div>
          </Card>
          
          <Card className="p-6 transition-all hover:shadow-md duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Appointments</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-2">{stats.todayAppointments ?? 0}</h3>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                <Calendar size={22} />
              </div>
            </div>
          </Card>

          <Card className="p-6 transition-all hover:shadow-md duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Waiting Patients</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-2">{stats.waitingPatients ?? 0}</h3>
              </div>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                <Clock size={22} />
              </div>
            </div>
          </Card>
        </div>
      )}
      
      {renderDashboardContent()}
    </div>
  );
};

export default DynamicDashboard;
