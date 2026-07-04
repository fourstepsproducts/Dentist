import React from 'react';
import { Card } from '../../../components/ui/Card';

const Settings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Clinic Portal / Settings</p>
      </div>

      <Card>
        <div className="p-8 text-center text-slate-500">
          <p className="text-lg font-medium">Settings Module</p>
          <p className="mt-2">This module is currently under construction.</p>
        </div>
      </Card>
    </div>
  );
};

export default Settings;
