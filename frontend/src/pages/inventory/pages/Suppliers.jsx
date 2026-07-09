import React, { useContext, useState } from 'react';
import { InventoryContext } from '../../../context/InventoryContext';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Card } from '../../../components/ui/Card';
import { Plus, Search, Edit, Trash2, Mail, Phone, Landmark } from 'lucide-react';

const Suppliers = () => {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useContext(InventoryContext);

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  const [form, setForm] = useState({
    name: '', company: '', contactPerson: '', phone: '', email: '',
    address: '', gstNumber: '', paymentTerms: 'Net 30', outstandingAmount: '', status: 'Active'
  });

  const handleEditClick = (supplier) => {
    setEditingSupplier(supplier);
    setForm({
      name: supplier.name,
      company: supplier.company,
      contactPerson: supplier.contactPerson,
      phone: supplier.phone,
      email: supplier.email,
      address: supplier.address,
      gstNumber: supplier.gstNumber,
      paymentTerms: supplier.paymentTerms,
      outstandingAmount: supplier.outstandingAmount,
      status: supplier.status
    });
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setEditingSupplier(null);
    setForm({
      name: '', company: '', contactPerson: '', phone: '', email: '',
      address: '', gstNumber: '', paymentTerms: 'Net 30', outstandingAmount: '0', status: 'Active'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingSupplier) {
      updateSupplier(editingSupplier.id, form);
    } else {
      addSupplier(form);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this supplier record? All pending invoice tracking links will remain active.')) {
      deleteSupplier(id);
    }
  };

  const filtered = suppliers.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.company.toLowerCase().includes(search.toLowerCase()) ||
    s.contactPerson.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-textPrimary tracking-tight">Suppliers</h1>
          <p className="text-textSecondary text-sm mt-1">Manage vendor information, outstanding invoices, payment terms, and credentials.</p>
        </div>
        <Button onClick={handleAddClick} size="sm">
          <Plus size={16} className="mr-2" /> Add Supplier
        </Button>
      </div>

      {/* Filter and Search */}
      <Card className="p-4 flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-textSecondary" size={18} />
          <Input 
            placeholder="Search by vendor name, company, representative..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Suppliers Table Card */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-textSecondary uppercase tracking-wider">
                <th className="py-3 px-4">Supplier Name</th>
                <th className="py-3 px-4">Company Details</th>
                <th className="py-3 px-4">Contact Person</th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-4">GST Number</th>
                <th className="py-3 px-4">Payment Terms</th>
                <th className="py-3 px-4">Outstanding Balance</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-4 font-semibold text-textPrimary">{s.name}</td>
                  <td className="py-4 px-4">
                    <div className="font-semibold text-textPrimary">{s.company}</div>
                    <div className="text-xs text-textSecondary">{s.address}</div>
                  </td>
                  <td className="py-4 px-4 text-textSecondary font-semibold">{s.contactPerson}</td>
                  <td className="py-4 px-4 text-xs text-textSecondary">
                    <div className="flex items-center gap-1.5"><Phone size={12} /> {s.phone}</div>
                    <div className="flex items-center gap-1.5 mt-1"><Mail size={12} /> {s.email}</div>
                  </td>
                  <td className="py-4 px-4 text-textSecondary font-semibold">{s.gstNumber}</td>
                  <td className="py-4 px-4 font-semibold text-textPrimary">{s.paymentTerms}</td>
                  <td className="py-4 px-4">
                    {s.outstandingAmount > 0 ? (
                      <span className="font-extrabold text-rose-600 inline-flex items-center gap-1">
                        <Landmark size={14} /> ${s.outstandingAmount.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-emerald-600 font-semibold">$0.00</span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      s.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex justify-end gap-1.5">
                      <Button variant="ghost" size="icon" onClick={() => handleEditClick(s)} title="Edit">
                        <Edit size={16} className="text-blue-600" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id)} title="Delete">
                        <Trash2 size={16} className="text-rose-600" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-textSecondary">
                    No suppliers found matching current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl bg-white p-6 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h3 className="font-bold text-lg text-textPrimary">
                {editingSupplier ? `Edit Supplier: ${editingSupplier.name}` : 'Add New Supplier'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-textSecondary hover:text-textPrimary text-xl font-bold">×</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-textPrimary">Supplier / Vendor Name *</label>
                  <Input 
                    value={form.name} 
                    onChange={(e) => setForm({ ...form, name: e.target.value })} 
                    placeholder="e.g. Dental Hub Supplies"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-textPrimary">Company Name *</label>
                  <Input 
                    value={form.company} 
                    onChange={(e) => setForm({ ...form, company: e.target.value })} 
                    placeholder="e.g. Dental Hub Pvt Ltd"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-textPrimary">Contact Representative *</label>
                  <Input 
                    value={form.contactPerson} 
                    onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} 
                    placeholder="e.g. John Doe"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-textPrimary">GST / Tax Number *</label>
                  <Input 
                    value={form.gstNumber} 
                    onChange={(e) => setForm({ ...form, gstNumber: e.target.value })} 
                    placeholder="e.g. GST27AAACDXXXX"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-textPrimary">Mobile Number *</label>
                  <Input 
                    value={form.phone} 
                    onChange={(e) => setForm({ ...form, phone: e.target.value })} 
                    placeholder="e.g. +1 555-0199"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-textPrimary">Email Address *</label>
                  <Input 
                    type="email"
                    value={form.email} 
                    onChange={(e) => setForm({ ...form, email: e.target.value })} 
                    placeholder="e.g. sales@company.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-textPrimary">Office Address *</label>
                <textarea 
                  value={form.address} 
                  onChange={(e) => setForm({ ...form, address: e.target.value })} 
                  placeholder="Enter full billing / shipping address"
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-[3px] focus:ring-blue-600/20 focus:border-blue-600"
                  rows="2"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-textPrimary">Payment Terms *</label>
                  <Select 
                    value={form.paymentTerms} 
                    onChange={(e) => setForm({ ...form, paymentTerms: e.target.value })}
                  >
                    <option value="Net 30">Net 30</option>
                    <option value="Net 15">Net 15</option>
                    <option value="COD">COD</option>
                    <option value="Immediate">Immediate</option>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-textPrimary">Outstanding Balance ($) *</label>
                  <Input 
                    type="number"
                    value={form.outstandingAmount} 
                    disabled={editingSupplier !== null} // Balance updated via payment log
                    onChange={(e) => setForm({ ...form, outstandingAmount: e.target.value })} 
                    placeholder="0"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-textPrimary">Supplier Status *</label>
                  <Select 
                    value={form.status} 
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit">Save Supplier</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Suppliers;
