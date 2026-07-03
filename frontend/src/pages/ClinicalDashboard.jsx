import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';

const ClinicalDashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-textPrimary tracking-tight">Clinical Dashboard</h1>
        <p className="text-textSecondary text-sm mt-1">View your daily schedule and patient records.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-textSecondary">You have no upcoming appointments for the next hour.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClinicalDashboard;
