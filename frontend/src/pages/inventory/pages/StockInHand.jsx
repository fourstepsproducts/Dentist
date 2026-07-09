import React, { useContext, useState } from 'react';
import { InventoryContext } from '../../../context/InventoryContext';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Search, AlertTriangle, CheckCircle, Flame } from 'lucide-react';

const StockInHand = () => {
  const { items, settings } = useContext(InventoryContext);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const getStatusInfo = (item) => {
    if (item.quantity === 0) {
      return { label: 'Out of Stock', color: 'bg-red-50 text-red-700 border-red-100', icon: <Flame size={12} className="text-red-500" /> };
    }
    if (item.quantity <= Math.ceil(item.minStock / 2)) {
      return { label: 'Critical Stock', color: 'bg-orange-50 text-orange-700 border-orange-100', icon: <AlertTriangle size={12} className="text-orange-500" /> };
    }
    if (item.quantity <= item.minStock) {
      return { label: 'Low Stock', color: 'bg-amber-50 text-amber-700 border-amber-100', icon: <AlertTriangle size={12} className="text-amber-500" /> };
    }
    return { label: 'In Stock', color: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: <CheckCircle size={12} className="text-emerald-500" /> };
  };

  const filtered = items.filter(item => {
    const statusInfo = getStatusInfo(item);
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.code.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter ? statusInfo.label === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-textPrimary tracking-tight">Stock in Hand</h1>
        <p className="text-textSecondary text-sm mt-1">Real-time tracking of current available quantities, reserved amounts, and safety stock levels.</p>
      </div>

      {/* Filter Card */}
      <Card className="p-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-textSecondary" size={18} />
          <Input 
            placeholder="Search by code or item name..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-48"
        >
          <option value="">All Stock Levels</option>
          <option value="In Stock">In Stock</option>
          <option value="Low Stock">Low Stock</option>
          <option value="Critical Stock">Critical Stock</option>
          <option value="Out of Stock">Out of Stock</option>
        </Select>
      </Card>

      {/* Grid summary of levels */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-emerald-50/50 border-emerald-100 flex flex-col justify-between">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">In Stock</span>
          <span className="text-3xl font-extrabold text-emerald-700 mt-2">
            {items.filter(i => i.quantity > i.minStock).length}
          </span>
        </Card>
        <Card className="p-4 bg-amber-50/50 border-amber-100 flex flex-col justify-between">
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Low Stock</span>
          <span className="text-3xl font-extrabold text-amber-700 mt-2">
            {items.filter(i => i.quantity > Math.ceil(i.minStock / 2) && i.quantity <= i.minStock).length}
          </span>
        </Card>
        <Card className="p-4 bg-orange-50/50 border-orange-100 flex flex-col justify-between">
          <span className="text-xs font-bold text-orange-800 uppercase tracking-wider">Critical Stock</span>
          <span className="text-3xl font-extrabold text-orange-700 mt-2">
            {items.filter(i => i.quantity > 0 && i.quantity <= Math.ceil(i.minStock / 2)).length}
          </span>
        </Card>
        <Card className="p-4 bg-red-50/50 border-red-100 flex flex-col justify-between">
          <span className="text-xs font-bold text-red-800 uppercase tracking-wider">Out of Stock</span>
          <span className="text-3xl font-extrabold text-red-700 mt-2">
            {items.filter(i => i.quantity === 0).length}
          </span>
        </Card>
      </div>

      {/* Stock Table */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-textSecondary uppercase tracking-wider">
                <th className="py-3 px-4">Item Details</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Available Qty</th>
                <th className="py-3 px-4 text-center">Reserved Qty</th>
                <th className="py-3 px-4 text-center">Min Level</th>
                <th className="py-3 px-4 text-center">Max Level</th>
                <th className="py-3 px-4">Stock Level Gauge</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last Sync</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((item) => {
                const status = getStatusInfo(item);
                const percent = Math.min(100, Math.round((item.quantity / item.maxStock) * 100));
                
                return (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-bold text-blue-600">{item.code}</div>
                      <div className="font-semibold text-textPrimary mt-0.5">{item.name}</div>
                      <div className="text-xs text-textSecondary">{item.brand} | {item.unit}</div>
                    </td>
                    <td className="py-4 px-4 text-textSecondary font-medium">{item.category}</td>
                    <td className="py-4 px-4 text-center font-extrabold text-textPrimary text-base">{item.quantity}</td>
                    <td className="py-4 px-4 text-center text-textSecondary font-medium">{item.reservedQuantity}</td>
                    <td className="py-4 px-4 text-center text-amber-600 font-bold">{item.minStock}</td>
                    <td className="py-4 px-4 text-center text-textSecondary font-medium">{item.maxStock}</td>
                    <td className="py-4 px-4 min-w-[150px]">
                      <div className="space-y-1">
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-300 ${
                            item.quantity === 0 ? 'bg-red-500' :
                            item.quantity <= item.minStock ? 'bg-amber-500' :
                            'bg-emerald-500'
                          }`} style={{ width: `${percent}%` }}></div>
                        </div>
                        <div className="flex justify-between text-[10px] text-textSecondary font-medium">
                          <span>{percent}% Filled</span>
                          <span>Max: {item.maxStock}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${status.color}`}>
                        {status.icon}
                        {status.label}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-xs text-textSecondary font-semibold">
                      {new Date().toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-textSecondary">
                    No stock in hand match filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default StockInHand;
