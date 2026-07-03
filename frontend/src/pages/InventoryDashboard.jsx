import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';

const InventoryDashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-textPrimary tracking-tight">Inventory Dashboard</h1>
        <p className="text-textSecondary text-sm mt-1">Monitor stock levels and supply orders.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Low Stock Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-textSecondary">All inventory levels are currently sufficient.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryDashboard;
