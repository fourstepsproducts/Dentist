import React, { useContext, useState } from 'react';
import { InventoryContext } from '../../../context/InventoryContext';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Card } from '../../../components/ui/Card';
import { 
  Plus, Search, Edit, Trash2, Download, Upload, 
  Barcode, CheckCircle, XCircle 
} from 'lucide-react';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import { showToast } from '../../../utils/toast';

const ItemManagement = () => {
  const { items, addItem, updateItem, deleteItem, suppliers, settings } = useContext(InventoryContext);

  // Filter/Search states
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // CRUD Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, itemId: null });

  // Barcode Modal
  const [barcodeItem, setBarcodeItem] = useState(null);

  // Form State
  const initialForm = {
    name: '', category: 'Restorative', unit: 'Syringe', brand: '',
    description: '', minStock: '', maxStock: '', supplierId: '',
    costPrice: '', sellingPrice: '', status: 'Active', expiryDate: ''
  };
  const [form, setForm] = useState(initialForm);

  // Filter Logic
  const filtered = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          item.code.toLowerCase().includes(search.toLowerCase()) ||
                          item.brand.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter ? item.category === categoryFilter : true;
    const matchesStatus = statusFilter ? item.status === statusFilter : true;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Pagination Logic
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const handleEditClick = (item) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      category: item.category,
      unit: item.unit,
      brand: item.brand,
      description: item.description,
      minStock: item.minStock,
      maxStock: item.maxStock,
      supplierId: item.supplierId,
      costPrice: item.costPrice,
      sellingPrice: item.sellingPrice,
      status: item.status,
      expiryDate: item.expiryDate === 'N/A' ? '' : item.expiryDate
    });
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setEditingItem(null);
    setForm(initialForm);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const cleanForm = {
      ...form,
      supplierId: Number(form.supplierId) || (suppliers[0]?.id || 1),
      expiryDate: form.expiryDate || 'N/A'
    };
    if (editingItem) {
      updateItem(editingItem.id, cleanForm);
    } else {
      addItem({ ...cleanForm, quantity: 0, reservedQuantity: 0 }); // Initial qty 0, added via transactions
    }
    setIsModalOpen(false);
  };

  const handleDeleteClick = (id) => {
    setDeleteConfirm({ isOpen: true, itemId: id });
  };

  const executeDelete = () => {
    if (deleteConfirm.itemId) {
      deleteItem(deleteConfirm.itemId);
      showToast.success('Item deleted successfully.');
    }
    setDeleteConfirm({ isOpen: false, itemId: null });
  };

  // Simulators
  const handleExportExcel = () => {
    const csvRows = [
      ['Item Code', 'Item Name', 'Category', 'Unit', 'Brand', 'Description', 'Quantity', 'Min Stock', 'Max Stock', 'Cost Price', 'Selling Price', 'Status', 'Expiry Date'],
      ...items.map(i => [
        i.code, i.name, i.category, i.unit, i.brand, i.description, i.quantity, i.minStock, i.maxStock, i.costPrice, i.sellingPrice, i.status, i.expiryDate
      ])
    ];
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Oasis_Dental_Inventory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportExcelSimulate = () => {
    showToast.info("Excel/CSV import simulated! Loading 3 new restorative items into inventory...");
    addItem({ name: 'Dental Composites Kit A', category: 'Restorative', unit: 'Set', brand: '3M ESPE', description: 'Restoration composites kit imported', minStock: 5, maxStock: 20, quantity: 15, reservedQuantity: 0, supplierId: 1, costPrice: 95.00, sellingPrice: 150.00, status: 'Active', expiryDate: '2028-10-10' });
    addItem({ name: 'Bonding Agent Refill', category: 'Restorative', unit: 'Bottle', brand: 'Hu-Friedy', description: 'Single bond adhesive', minStock: 10, maxStock: 40, quantity: 20, reservedQuantity: 0, supplierId: 2, costPrice: 35.00, sellingPrice: 50.00, status: 'Active', expiryDate: '2027-05-15' });
  };

  return (
    <div className="space-y-6">
      {/* Title & Top Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-textPrimary tracking-tight">Item Management</h1>
          <p className="text-textSecondary text-sm mt-1">Manage and track specifications, prices, and suppliers of clinic items.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleImportExcelSimulate}>
            <Upload size={16} className="mr-2" /> Import Excel
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportExcel}>
            <Download size={16} className="mr-2" /> Export Excel
          </Button>
          <Button onClick={handleAddClick} size="sm">
            <Plus size={16} className="mr-2" /> Add Item
          </Button>
        </div>
      </div>

      {/* Filter and Search Card */}
      <Card className="p-4 flex flex-col md:flex-row md:items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-textSecondary" size={18} />
          <Input 
            placeholder="Search by code, item name, brand..." 
            value={search} 
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="pl-10"
          />
        </div>
        <div className="flex gap-4">
          <Select 
            value={categoryFilter} 
            onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
            className="w-40"
          >
            <option value="">All Categories</option>
            {settings.categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </Select>
          <Select 
            value={statusFilter} 
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="w-36"
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </Select>
        </div>
      </Card>

      {/* Items Table Card */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-textSecondary uppercase tracking-wider">
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Item Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Brand</th>
                <th className="py-3 px-4">Stock Limit (Min / Max)</th>
                <th className="py-3 px-4">Price (Cost / Sell)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {currentItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-4 font-bold text-blue-600">{item.code}</td>
                  <td className="py-4 px-4 font-semibold text-textPrimary">
                    {item.name}
                    <span className="block text-xs font-normal text-textSecondary mt-0.5">{item.unit} | {item.description}</span>
                  </td>
                  <td className="py-4 px-4 text-textSecondary">{item.category}</td>
                  <td className="py-4 px-4 text-textSecondary">{item.brand}</td>
                  <td className="py-4 px-4">
                    <span className="font-semibold text-textPrimary">{item.minStock}</span> / <span className="text-textSecondary">{item.maxStock}</span>
                  </td>
                  <td className="py-4 px-4 font-medium text-textPrimary">
                    ${item.costPrice.toFixed(2)} / <span className="text-emerald-600 font-bold">${item.sellingPrice.toFixed(2)}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      item.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => setBarcodeItem(item)} title="Barcode">
                        <Barcode size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEditClick(item)} title="Edit">
                        <Edit size={16} className="text-blue-600" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(item.id)} title="Delete">
                        <Trash2 size={16} className="text-rose-600" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-textSecondary">
                    No items found matching the filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-6">
            <span className="text-xs text-textSecondary font-semibold">
              Showing {indexOfFirst + 1} to {Math.min(indexOfLast, filtered.length)} of {filtered.length} entries
            </span>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage === 1} 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage === totalPages} 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* CRUD Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl bg-white p-6 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h3 className="font-bold text-lg text-textPrimary">
                {editingItem ? `Edit Item: ${editingItem.code}` : 'Add New Inventory Item'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-textSecondary hover:text-textPrimary text-xl font-bold">×</button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-textPrimary">Item Name *</label>
                  <Input 
                    value={form.name} 
                    onChange={(e) => setForm({ ...form, name: e.target.value })} 
                    placeholder="Enter item name"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-textPrimary">Category *</label>
                  <Select 
                    value={form.category} 
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    {settings.categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-textPrimary">Brand *</label>
                  <Input 
                    value={form.brand} 
                    onChange={(e) => setForm({ ...form, brand: e.target.value })} 
                    placeholder="e.g. 3M ESPE"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-textPrimary">Unit of Measure *</label>
                  <Select 
                    value={form.unit} 
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  >
                    {settings.units.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-textPrimary">Description</label>
                <textarea 
                  value={form.description} 
                  onChange={(e) => setForm({ ...form, description: e.target.value })} 
                  placeholder="Enter brief description"
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-[3px] focus:ring-blue-600/20 focus:border-blue-600"
                  rows="2"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-textPrimary">Minimum Stock Level *</label>
                  <Input 
                    type="number"
                    value={form.minStock} 
                    onChange={(e) => setForm({ ...form, minStock: e.target.value })} 
                    placeholder="e.g. 10"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-textPrimary">Maximum Stock Level *</label>
                  <Input 
                    type="number"
                    value={form.maxStock} 
                    onChange={(e) => setForm({ ...form, maxStock: e.target.value })} 
                    placeholder="e.g. 100"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-textPrimary">Cost Price ($) *</label>
                  <Input 
                    type="number"
                    step="0.01"
                    value={form.costPrice} 
                    onChange={(e) => setForm({ ...form, costPrice: e.target.value })} 
                    placeholder="45.00"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-textPrimary">Selling Price ($) *</label>
                  <Input 
                    type="number"
                    step="0.01"
                    value={form.sellingPrice} 
                    onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })} 
                    placeholder="65.00"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-textPrimary">Supplier *</label>
                  <Select 
                    value={form.supplierId} 
                    onChange={(e) => setForm({ ...form, supplierId: e.target.value })}
                  >
                    <option value="">Select Supplier</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-textPrimary">Expiry Date (If applicable)</label>
                  <Input 
                    type="date"
                    value={form.expiryDate} 
                    onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-textPrimary">Status *</label>
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
                <Button type="submit">Submit</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Barcode Simulator Modal */}
      {barcodeItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-sm bg-white p-6 text-center space-y-6">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h3 className="font-bold text-lg text-textPrimary">Barcode Simulator</h3>
              <button onClick={() => setBarcodeItem(null)} className="text-textSecondary hover:text-textPrimary text-xl font-bold">×</button>
            </div>
            
            <div className="space-y-1">
              <h4 className="font-bold text-textPrimary">{barcodeItem.name}</h4>
              <p className="text-xs text-textSecondary">{barcodeItem.brand} | {barcodeItem.code}</p>
            </div>

            <div className="bg-slate-50 p-6 rounded-xl inline-block border border-dashed border-slate-300">
              {/* Fake SVG Barcode */}
              <svg className="mx-auto w-48 h-16" viewBox="0 0 100 30" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="30" fill="white"/>
                {/* Random barcode bars */}
                <rect x="5" y="2" width="2" height="20" fill="black"/>
                <rect x="8" y="2" width="1" height="20" fill="black"/>
                <rect x="11" y="2" width="3" height="20" fill="black"/>
                <rect x="16" y="2" width="1" height="20" fill="black"/>
                <rect x="19" y="2" width="2" height="20" fill="black"/>
                <rect x="23" y="2" width="4" height="20" fill="black"/>
                <rect x="29" y="2" width="1" height="20" fill="black"/>
                <rect x="32" y="2" width="2" height="20" fill="black"/>
                <rect x="36" y="2" width="1" height="20" fill="black"/>
                <rect x="39" y="2" width="3" height="20" fill="black"/>
                <rect x="44" y="2" width="2" height="20" fill="black"/>
                <rect x="48" y="2" width="1" height="20" fill="black"/>
                <rect x="51" y="2" width="4" height="20" fill="black"/>
                <rect x="57" y="2" width="2" height="20" fill="black"/>
                <rect x="61" y="2" width="1" height="20" fill="black"/>
                <rect x="64" y="2" width="3" height="20" fill="black"/>
                <rect x="69" y="2" width="1" height="20" fill="black"/>
                <rect x="72" y="2" width="2" height="20" fill="black"/>
                <rect x="76" y="2" width="4" height="20" fill="black"/>
                <rect x="82" y="2" width="1" height="20" fill="black"/>
                <rect x="85" y="2" width="3" height="20" fill="black"/>
                <rect x="90" y="2" width="2" height="20" fill="black"/>
                <rect x="94" y="2" width="1" height="20" fill="black"/>
                
                <text x="50" y="27" fontSize="4" fontFamily="monospace" textAnchor="middle" fill="black">{barcodeItem.code}</text>
              </svg>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setBarcodeItem(null)}>Close</Button>
              <Button className="flex-1" onClick={() => { showToast.success('Sending print job to barcode printer...'); setBarcodeItem(null); }}>Print Barcode</Button>
            </div>
          </Card>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, itemId: null })}
        onConfirm={executeDelete}
        title="Delete Inventory Item"
        description="Are you sure you want to delete this inventory item? This will remove all associated logs."
        confirmText="Delete Item"
      />
    </div>
  );
};

export default ItemManagement;
