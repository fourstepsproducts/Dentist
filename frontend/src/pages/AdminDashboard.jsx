import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Users, Calendar, Activity, UserPlus } from 'lucide-react';

const AdminDashboard = () => {
  const [counts, setCounts] = useState({ totalStaff: 0, totalDoctors: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/admin/dashboard/counts', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCounts(res.data);
      } catch (err) {
        console.error('Failed to fetch dashboard counts', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCounts();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-textPrimary tracking-tight">Admin Overview</h1>
        <p className="text-textSecondary text-sm mt-1">Manage staff, configurations, and overall clinic performance.</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-textSecondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : counts.totalStaff}</div>
            <p className="text-xs text-textSecondary mt-1">Non-doctor employees</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Doctors</CardTitle>
            <UserPlus className="h-4 w-4 text-textSecondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : counts.totalDoctors}</div>
            <p className="text-xs text-textSecondary mt-1">Clinical doctors</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Appointments Today</CardTitle>
            <Calendar className="h-4 w-4 text-textSecondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-textSecondary mt-1">94% attendance rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">Optimal</div>
            <p className="text-xs text-textSecondary mt-1">All services operational</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
