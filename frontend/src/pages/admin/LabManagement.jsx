import React, { useState } from 'react';
import { Plus, Search, Phone, Mail, Activity } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Card } from '../../components/ui/Card';

const mockLabs = [
  { id: 'LAB01', name: 'Precision Dental Lab', contact: 'Robert Downey', phone: '+1 234-567-1111', email: 'orders@precisionlab.com', turnTime: '2-3 Days', tests: 14, status: 'Active' },
  { id: 'LAB02', name: 'Smile Crafters', contact: 'Emma Stone', phone: '+1 234-567-2222', email: 'hello@smilecrafters.com', turnTime: '4-5 Days', tests: 8, status: 'Active' },
];

const LabManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Laboratory Management</h1>
          <p className="text-slate-500 text-sm mt-1">Manage external partner labs and their turnaround times.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="shrink-0">
          <Plus size={18} className="mr-2" />
          Add Laboratory
        </Button>
      </div>

      <Card>
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-t-xl">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input placeholder="Search labs by name or contact..." className="pl-10 bg-white" />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-medium">Laboratory Details</th>
                <th className="px-6 py-4 font-medium">Contact Person</th>
                <th className="px-6 py-4 font-medium">Performance</th>
                <th className="px-6 py-4 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockLabs.map((lab) => (
                <tr key={lab.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">{lab.name}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <Mail size={12} /> {lab.email}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Phone size={12} /> {lab.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-800">{lab.contact}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <Badge variant="primary" className="w-fit">{lab.tests} Available Tests</Badge>
                      <span className="text-xs text-slate-500 font-medium">TAT: {lab.turnTime}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Badge variant={lab.status === 'Active' ? 'success' : 'danger'}>{lab.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Laboratory Partner">
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Lab Name</label>
              <Input placeholder="Enter lab name" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Contact Person</label>
              <Input placeholder="Full name" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Email Address</label>
              <Input type="email" placeholder="email@lab.com" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Phone Number</label>
              <Input placeholder="+1 234 567 8900" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Turnaround Time</label>
              <Input placeholder="e.g. 2-3 Days" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Available Tests Count</label>
              <Input type="number" placeholder="10" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Physical Address</label>
            <textarea className="w-full h-24 p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm text-sm" placeholder="Enter full lab address..."></textarea>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="ghost" onClick={(e) => { e.preventDefault(); setIsModalOpen(false); }}>Cancel</Button>
            <Button type="submit">Add Laboratory</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default LabManagement;
