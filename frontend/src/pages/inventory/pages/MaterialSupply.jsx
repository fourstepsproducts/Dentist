import React, { useContext, useState } from 'react';
import { InventoryContext } from '../../../context/InventoryContext';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Card } from '../../../components/ui/Card';
import { Plus, Search, Truck, CheckCircle2, Clock } from 'lucide-react';

const MaterialSupply = () => {
  const { supplies, addMaterialSupply, suppliers, items } = useContext(InventoryContext);

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [form, setForm] = useState({
    supplierId: '', itemId: '', quantity: '', supplyDate: new Date().toISOString().split('T')[0],
    invoiceNumber: '', purchaseCost: '', deliveryStatus: 'Delivered', paymentStatus: 'Pending', notes: ''
  });

  const handleAddSupply = (e) => {
    e.preventDefault();
    addMaterialSupply({
      ...form,
      supplierId: Number(form.supplierId),
      itemId: Number(form.itemId),
      quantity: Number(form.quantity),
      purchaseCost: Number(form.purchaseCost)
    });
    setIsModalOpen(false);
    // Reset Form
    setForm({
      supplierId: '', itemId: '', quantity: '', supplyDate: new Date().toISOString().split('T')[0],
      invoiceNumber: '', purchaseCost: '', deliveryStatus: 'Delivered', paymentStatus: 'Pending', notes: ''
    });
  };

  const filtered = supplies.filter(s => {
    const supplier = suppliers.find(sup => sup.id === s.supplierId);
    const item = items.find(i => i.id === s.itemId);
    const searchString = `${supplier?.name || ''} ${item?.name || ''} ${s.invoiceNumber || ''}`.toLowerCase();
    return searchString.includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-textPrimary tracking-tight">Material Supply Management</h1>
          <p className="text-textSecondary text-sm mt-1">Record and manage external supply batches delivered to the clinic.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} size="sm">
          <Plus size={16} className="mr-2" /> Add Supply Log
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4 flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-textSecondary" size={18} />
          <Input 
            placeholder="Search by supplier, item, invoice number..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Supplies Log List */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-textSecondary uppercase tracking-wider">
                <th className="py-3 px-4">Supply Date</th>
                <th className="py-3 px-4">Invoice No.</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Item Supplied</th>
                <th className="py-3 px-4 text-center">Quantity</th>
                <th className="py-3 px-4">Total Cost</th>
                <th className="py-3 px-4">Delivery</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((s) => {
                const supplier = suppliers.find(sup => sup.id === s.supplierId);
                const item = items.find(i => i.id === s.itemId);
                return (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4 text-textSecondary font-medium">
                      {new Date(s.supplyDate).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 font-bold text-textPrimary">#{s.invoiceNumber || 'N/A'}</td>
                    <td className="py-4 px-4 font-semibold text-textPrimary">{supplier?.name || 'Unknown Supplier'}</td>
                    <td className="py-4 px-4 font-medium text-textPrimary">
                      {item?.name || 'Unknown Item'}
                      <span className="block text-xs font-normal text-textSecondary mt-0.5">{item?.brand}</span>
                    </td>
                    <td className="py-4 px-4 text-center font-bold text-textPrimary">{s.quantity} {item?.unit}</td>
                    <td className="py-4 px-4 font-bold text-textPrimary">${s.purchaseCost.toFixed(2)}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        s.deliveryStatus === 'Delivered' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {s.deliveryStatus === 'Delivered' ? <CheckCircle2 size={12} /> : <Truck size={12} />}
                        {s.deliveryStatus}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        s.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {s.paymentStatus === 'Paid' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                        {s.paymentStatus}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-textSecondary italic text-xs max-w-xs truncate">{s.notes || '-'}</td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-textSecondary">
                    No material supply logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Supply Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg bg-white p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h3 className="font-bold text-lg text-textPrimary">Log Supplied Materials</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-textSecondary hover:text-textPrimary text-xl font-bold">×</button>
            </div>

            <form onSubmit={handleAddSupply} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-textPrimary">Supplier *</label>
                  <Select 
                    value={form.supplierId} 
                    onChange={(e) => setForm({ ...form, supplierId: e.target.value })}
                    required
                  >
                    <option value="">Select Supplier</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-textPrimary">Item *</label>
                  <Select 
                    value={form.itemId} 
                    onChange={(e) => setForm({ ...form, itemId: e.target.value })}
                    required
                  >
                    <option value="">Select Item</option>
                    {items.map(i => (
                      <option key={i.id} value={i.id}>{i.name} ({i.code})</option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-textPrimary">Quantity *</label>
                  <Input 
                    type="number" 
                    value={form.quantity} 
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })} 
                    placeholder="e.g. 50"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-textPrimary">Total Purchase Cost ($) *</label>
                  <Input 
                    type="number" 
                    step="0.01"
                    value={form.purchaseCost} 
                    onChange={(e) => setForm({ ...form, purchaseCost: e.target.value })} 
                    placeholder="e.g. 750.00"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-textPrimary">Invoice Number *</label>
                  <Input 
                    value={form.invoiceNumber} 
                    onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })} 
                    placeholder="INV-XXXX"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-textPrimary">Supply Date *</label>
                  <Input 
                    type="date" 
                    value={form.supplyDate} 
                    onChange={(e) => setForm({ ...form, supplyDate: e.target.value })} 
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-textPrimary">Delivery Status *</label>
                  <Select 
                    value={form.deliveryStatus} 
                    onChange={(e) => setForm({ ...form, deliveryStatus: e.target.value })}
                  >
                    <option value="Delivered">Delivered</option>
                    <option value="Pending">Pending</option>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-textPrimary">Payment Status *</label>
                  <Select 
                    value={form.paymentStatus} 
                    onChange={(e) => setForm({ ...form, paymentStatus: e.target.value })}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-textPrimary">Notes</label>
                <textarea 
                  value={form.notes} 
                  onChange={(e) => setForm({ ...form, notes: e.target.value })} 
                  placeholder="Additional delivery notes..."
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-[3px] focus:ring-blue-600/20 focus:border-blue-600"
                  rows="2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit">Log Supply</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MaterialSupply;
