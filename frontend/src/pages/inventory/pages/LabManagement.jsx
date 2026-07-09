import React, { useContext, useState } from 'react';
import { InventoryContext } from '../../../context/InventoryContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { 
  Beaker, Plus, Mail, Phone, Edit, Trash2, 
  Layers, ClipboardList, TrendingDown 
} from 'lucide-react';

const LabManagement = () => {
  const { 
    laboratories, addLab, updateLab, deleteLab, 
    materialRequirements, stockTransactions, items 
  } = useContext(InventoryContext);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLab, setEditingLab] = useState(null);

  // Tab views for laboratory details
  const [selectedLabId, setSelectedLabId] = useState(1);
  const [detailsTab, setDetailsTab] = useState('inventory'); // 'inventory', 'requests', 'history'

  const [form, setForm] = useState({
    name: '', department: 'General', incharge: '', phone: '', email: ''
  });

  const handleEditClick = (lab) => {
    setEditingLab(lab);
    setForm({
      name: lab.name, department: lab.department, incharge: lab.incharge, phone: lab.phone, email: lab.email
    });
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setEditingLab(null);
    setForm({ name: '', department: 'General', incharge: '', phone: '', email: '' });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingLab) {
      updateLab(editingLab.id, form);
    } else {
      addLab(form);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this laboratory? All assigned configuration records will be detached.')) {
      deleteLab(id);
    }
  };

  // Computations for details panel
  const activeLab = laboratories.find(l => l.id === selectedLabId) || laboratories[0];
  
  // Filter transactions representing "Stock Out" with references indicating Lab fulfillment
  const labHistory = stockTransactions.filter(t => 
    t.type === 'Stock Out' && 
    (t.remarks.includes(activeLab?.name) || t.reference.includes(`Req-Fulfill`))
  );

  // Material requests for this lab
  const labRequests = materialRequirements.filter(r => r.labId === selectedLabId);

  // Assigned inventory simulator (items this lab uses/requests)
  const assignedItems = items.filter(item => 
    labRequests.some(r => r.itemId === item.id)
  );

  return (
    <div className="space-y-6">
      {/* Title & Top Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-textPrimary tracking-tight">Laboratory Management</h1>
          <p className="text-textSecondary text-sm mt-1">Manage clinical laboratories, in-charges, and track material allocations.</p>
        </div>
        <Button onClick={handleAddClick} size="sm">
          <Plus size={16} className="mr-2" /> Add Laboratory
        </Button>
      </div>

      {/* Grid of Labs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {laboratories.map((lab) => (
          <Card 
            key={lab.id} 
            className={`p-5 space-y-4 hover:shadow-md cursor-pointer transition-all border ${
              selectedLabId === lab.id ? 'border-2 border-primary shadow-sm bg-blue-50/10' : 'border-border'
            }`}
            onClick={() => setSelectedLabId(lab.id)}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-3">
                <div className={`p-2.5 rounded-xl ${selectedLabId === lab.id ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <Beaker size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-textPrimary text-base">{lab.name}</h3>
                  <span className="text-xs text-textSecondary font-semibold uppercase tracking-wider">{lab.department}</span>
                </div>
              </div>
              
              <div className="flex space-x-1" onClick={e => e.stopPropagation()}>
                <Button variant="ghost" size="icon" onClick={() => handleEditClick(lab)} className="h-8 w-8 text-blue-600 hover:bg-blue-50">
                  <Edit size={14} />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(lab.id)} className="h-8 w-8 text-rose-600 hover:bg-rose-50">
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-textSecondary font-medium">
              <div className="flex items-center gap-2">
                <span className="font-bold text-textPrimary">In-Charge:</span>
                <span>{lab.incharge}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={12} className="text-textSecondary" />
                <span>{lab.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={12} className="text-textSecondary" />
                <span>{lab.phone}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-border flex justify-between items-center text-xs text-textSecondary font-semibold">
              <span>{materialRequirements.filter(r => r.labId === lab.id).length} Material Requests</span>
              <span className={`px-2 py-0.5 rounded-full ${lab.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>{lab.status}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Lab Details Panel */}
      {activeLab && (
        <Card className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-4 gap-4">
            <div>
              <h2 className="font-bold text-xl text-textPrimary">Laboratory Details: {activeLab.name}</h2>
              <p className="text-xs text-textSecondary mt-0.5">Monitoring current allocations, request history, and usages.</p>
            </div>
            
            {/* Tabs selector */}
            <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
              <button 
                onClick={() => setDetailsTab('inventory')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  detailsTab === 'inventory' ? 'bg-white text-textPrimary shadow-sm' : 'text-textSecondary hover:text-textPrimary'
                }`}
              >
                <Layers size={14} className="inline mr-1.5" /> Assigned Inventory ({assignedItems.length})
              </button>
              <button 
                onClick={() => setDetailsTab('requests')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  detailsTab === 'requests' ? 'bg-white text-textPrimary shadow-sm' : 'text-textSecondary hover:text-textPrimary'
                }`}
              >
                <ClipboardList size={14} className="inline mr-1.5" /> Requests Board ({labRequests.length})
              </button>
              <button 
                onClick={() => setDetailsTab('history')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  detailsTab === 'history' ? 'bg-white text-textPrimary shadow-sm' : 'text-textSecondary hover:text-textPrimary'
                }`}
              >
                <TrendingDown size={14} className="inline mr-1.5" /> Consumption History ({labHistory.length})
              </button>
            </div>
          </div>

          {/* Details Content Panels */}
          {detailsTab === 'inventory' && (
            <div className="space-y-4">
              <span className="text-xs font-bold text-textSecondary uppercase tracking-wider block">Currently Allocated Items</span>
              {assignedItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {assignedItems.map(item => (
                    <div key={item.id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center">
                      <div>
                        <span className="font-bold text-blue-600 text-xs block">{item.code}</span>
                        <span className="font-semibold text-textPrimary text-sm">{item.name}</span>
                        <span className="block text-[11px] text-textSecondary mt-0.5">{item.brand} | {item.unit}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-extrabold text-textPrimary block">{item.quantity} In Hand</span>
                        <span className="text-[10px] text-emerald-600 font-semibold uppercase">{item.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-textSecondary italic py-4">No materials allocated to this laboratory yet. Complete a material request to allocate items.</p>
              )}
            </div>
          )}

          {detailsTab === 'requests' && (
            <div className="space-y-4">
              <span className="text-xs font-bold text-textSecondary uppercase tracking-wider block">Material Request Logs</span>
              {labRequests.length > 0 ? (
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs text-textSecondary uppercase tracking-wider">
                      <th className="py-2.5">Date</th>
                      <th className="py-2.5">Requested Item</th>
                      <th className="py-2.5 text-center">Req. Qty</th>
                      <th className="py-2.5">Priority</th>
                      <th className="py-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {labRequests.map(r => {
                      const item = items.find(i => i.id === r.itemId);
                      return (
                        <tr key={r.id}>
                          <td className="py-3 text-textSecondary font-semibold">{new Date(r.requiredDate).toLocaleDateString()}</td>
                          <td className="py-3 font-semibold text-textPrimary">{item?.name || 'Unknown Item'}</td>
                          <td className="py-3 text-center font-bold text-textPrimary">{r.requestedQuantity}</td>
                          <td className="py-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${
                              r.priority === 'High' ? 'bg-red-50 text-red-700' : 'bg-slate-50 text-slate-700'
                            }`}>{r.priority}</span>
                          </td>
                          <td className="py-3 font-semibold text-textSecondary">{r.status}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <p className="text-sm text-textSecondary italic py-4">No material requests recorded for this laboratory.</p>
              )}
            </div>
          )}

          {detailsTab === 'history' && (
            <div className="space-y-4">
              <span className="text-xs font-bold text-textSecondary uppercase tracking-wider block">Laboratory Stock Consumption Audits</span>
              {labHistory.length > 0 ? (
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs text-textSecondary uppercase tracking-wider">
                      <th className="py-2.5">Date</th>
                      <th className="py-2.5">Item Consumed</th>
                      <th className="py-2.5 text-center">Quantity</th>
                      <th className="py-2.5">Reference</th>
                      <th className="py-2.5">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {labHistory.map(h => {
                      const item = items.find(i => i.id === h.itemId);
                      return (
                        <tr key={h.id}>
                          <td className="py-3 text-textSecondary">{new Date(h.date).toLocaleDateString()}</td>
                          <td className="py-3 font-semibold text-textPrimary">{item?.name}</td>
                          <td className="py-3 text-center font-bold text-rose-600">{h.quantity}</td>
                          <td className="py-3 text-textSecondary font-semibold">{h.reference}</td>
                          <td className="py-3 text-textSecondary italic text-xs">{h.remarks}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <p className="text-sm text-textSecondary italic py-4">No stock consumption logs recorded for this laboratory.</p>
              )}
            </div>
          )}
        </Card>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-white p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h3 className="font-bold text-lg text-textPrimary">
                {editingLab ? `Edit Lab: ${editingLab.name}` : 'Add New Laboratory'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-textSecondary hover:text-textPrimary text-xl font-bold">×</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-textPrimary">Laboratory Name *</label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Orthodontic Lab Alpha"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-textPrimary">Department *</label>
                <Select
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                >
                  <option value="General">General</option>
                  <option value="Orthodontics">Orthodontics</option>
                  <option value="Prosthodontics">Prosthodontics</option>
                  <option value="Endodontics">Endodontics</option>
                  <option value="Oral Surgery">Oral Surgery</option>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-textPrimary">Lab Incharge Name *</label>
                <Input
                  value={form.incharge}
                  onChange={(e) => setForm({ ...form, incharge: e.target.value })}
                  placeholder="e.g. Dr. Emily Stone"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-textPrimary">Contact Number *</label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="e.g. +1 555-0155"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-textPrimary">Contact Email *</label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="e.g. lab@oasis.com"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit">Save Laboratory</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default LabManagement;
