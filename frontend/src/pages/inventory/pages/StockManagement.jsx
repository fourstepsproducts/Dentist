import React, { useContext, useState } from 'react';
import { InventoryContext } from '../../../context/InventoryContext';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Card } from '../../../components/ui/Card';
import { ArrowDown, ArrowUp, Edit, History, Plus, RotateCcw, ShieldAlert, Sparkles } from 'lucide-react';
import { showToast } from '../../../utils/toast';

const StockManagement = () => {
  const { items, stockTransactions, addStockTransaction, settings } = useContext(InventoryContext);

  const [activeTab, setActiveTab] = useState('history'); // 'history' or 'new-transaction'
  
  // Transaction Form state
  const [form, setForm] = useState({
    itemId: '',
    type: 'Stock In',
    quantity: '',
    reference: '',
    remarks: ''
  });

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const qty = Number(form.quantity);
    
    // Validate stock levels for reductions (Stock Out, Damaged, Transfer)
    const selectedItem = items.find(i => i.id === Number(form.itemId));
    
    // If deduction type, make sure it is stored as negative quantity in context
    let adjustedQty = qty;
    if (['Stock Out', 'Stock Transfer', 'Damaged Stock'].includes(form.type)) {
      if (selectedItem && selectedItem.quantity < qty) {
        showToast.warning(`Insufficient stock! ${selectedItem.name} only has ${selectedItem.quantity} units available.`);
        return;
      }
      adjustedQty = -qty;
    } else if (form.type === 'Stock Adjustment') {
      // Adjustment can be negative or positive, but we let user specify negative or positive.
      // If we assume user enters positive but selects type "Stock Adjustment (Reduction)", we can handle it.
      // For simplicity, we just check if they entered negative or positive, and check bounds.
      if (qty < 0 && selectedItem && selectedItem.quantity < Math.abs(qty)) {
        showToast.warning(`Insufficient stock for adjustment!`);
        return;
      }
      adjustedQty = qty;
    }

    addStockTransaction({
      ...form,
      itemId: Number(form.itemId),
      quantity: adjustedQty
    });

    setForm({
      itemId: '',
      type: 'Stock In',
      quantity: '',
      reference: '',
      remarks: ''
    });

    showToast.success('Stock transaction recorded successfully.');
    setActiveTab('history');
  };

  return (
    <div className="space-y-6">
      {/* Title & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-textPrimary tracking-tight">Stock Management</h1>
          <p className="text-textSecondary text-sm mt-1">Manage manual stock adjustments, internal transfers, and transaction history.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
          <button 
            onClick={() => setActiveTab('history')} 
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'history' ? 'bg-white text-textPrimary shadow-sm' : 'text-textSecondary hover:text-textPrimary'
            }`}
          >
            <History size={16} className="inline mr-2" /> History Log
          </button>
          <button 
            onClick={() => setActiveTab('new-transaction')} 
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'new-transaction' ? 'bg-white text-textPrimary shadow-sm' : 'text-textSecondary hover:text-textPrimary'
            }`}
          >
            <Plus size={16} className="inline mr-2" /> Log Transaction
          </button>
        </div>
      </div>

      {activeTab === 'history' ? (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-textPrimary">All Stock Transactions</h3>
            <span className="text-xs text-textSecondary font-semibold">Ordered by Date</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-textSecondary uppercase tracking-wider">
                  <th className="py-3 px-4">Transaction ID</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Item Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4 text-center">Qty Changed</th>
                  <th className="py-3 px-4">Reference</th>
                  <th className="py-3 px-4">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {stockTransactions.map((tx) => {
                  const item = items.find(i => i.id === tx.itemId);
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-4 font-bold text-slate-500">TX-{String(tx.id).padStart(4, '0')}</td>
                      <td className="py-4 px-4 text-textSecondary">
                        {new Date(tx.date).toLocaleDateString()} {new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-4 px-4 font-semibold text-textPrimary">{item?.name || 'Deleted Item'}</td>
                      <td className="py-4 px-4 text-textSecondary">{item?.category || '-'}</td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          tx.type === 'Stock In' ? 'bg-emerald-50 text-emerald-700' :
                          tx.type === 'Stock Out' ? 'bg-amber-50 text-amber-700' :
                          tx.type === 'Stock Adjustment' ? 'bg-blue-50 text-blue-700' :
                          tx.type === 'Stock Transfer' ? 'bg-purple-50 text-purple-700' :
                          tx.type === 'Damaged Stock' ? 'bg-red-50 text-red-700' :
                          'bg-teal-50 text-teal-700'
                        }`}>
                          {tx.type === 'Stock In' && <ArrowDown size={12} />}
                          {tx.type === 'Stock Out' && <ArrowUp size={12} />}
                          {tx.type === 'Stock Adjustment' && <Edit size={12} />}
                          {tx.type === 'Damaged Stock' && <ShieldAlert size={12} />}
                          {tx.type === 'Returned Stock' && <RotateCcw size={12} />}
                          {tx.type}
                        </span>
                      </td>
                      <td className={`py-4 px-4 text-center font-bold ${tx.quantity > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {tx.quantity > 0 ? `+${tx.quantity}` : tx.quantity}
                      </td>
                      <td className="py-4 px-4 text-textSecondary font-semibold">{tx.reference}</td>
                      <td className="py-4 px-4 text-textSecondary italic text-xs max-w-xs truncate">{tx.remarks || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6 space-y-6">
            <h3 className="font-bold text-lg text-textPrimary border-b border-border pb-3">New Stock Transaction Form</h3>
            
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-textPrimary">Select Inventory Item *</label>
                  <Select
                    value={form.itemId}
                    onChange={(e) => setForm({ ...form, itemId: e.target.value })}
                    required
                  >
                    <option value="">Select Item</option>
                    {items.map(i => (
                      <option key={i.id} value={i.id}>{i.name} ({i.code}) - {i.quantity} available</option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-textPrimary">Transaction Type *</label>
                  <Select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    required
                  >
                    <option value="Stock In">Stock In (Increase)</option>
                    <option value="Stock Out">Stock Out (Decrease/Consume)</option>
                    <option value="Stock Adjustment">Stock Adjustment (Manual Count Fix)</option>
                    <option value="Stock Transfer">Stock Transfer (Send to Labs)</option>
                    <option value="Damaged Stock">Damaged Stock (Discard)</option>
                    <option value="Returned Stock">Returned Stock (Return from Labs/Patient)</option>
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
                    placeholder="Enter quantity (positive value)"
                    required
                  />
                  <span className="text-[10px] text-textSecondary italic">
                    Note: The system will automatically apply addition or reduction based on the transaction type.
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-textPrimary">Reference *</label>
                  <Input 
                    value={form.reference}
                    onChange={(e) => setForm({ ...form, reference: e.target.value })}
                    placeholder="e.g. Req-Fulfill-01, Audit 2026, Dr. Sarah"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-textPrimary">Remarks / Details</label>
                <textarea 
                  value={form.remarks}
                  onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                  placeholder="Provide transaction details or reasons..."
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-[3px] focus:ring-blue-600/20 focus:border-blue-600"
                  rows="3"
                />
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setActiveTab('history')}>Cancel</Button>
                <Button type="submit">Execute Transaction</Button>
              </div>
            </form>
          </Card>

          {/* Quick Guidance Card */}
          <Card className="p-6 space-y-4 h-fit bg-slate-50 border-slate-200">
            <div className="flex items-center space-x-2 text-blue-600">
              <Sparkles size={20} />
              <h4 className="font-bold text-textPrimary">System Rules</h4>
            </div>
            <ul className="text-xs text-textSecondary space-y-2.5 list-disc pl-4 leading-relaxed font-medium">
              <li>
                <strong>Stock In / Returns</strong> add quantity directly to current stock.
              </li>
              <li>
                <strong>Stock Out / Damage / Transfers</strong> deduct from stock and will prompt a validation error if quantity falls below 0.
              </li>
              <li>
                All transactions are logged in the <strong>Audit History</strong> and are immutable to maintain clinical integrity.
              </li>
              <li>
                Adjusting stock triggers real-time alerts in <strong>Notifications</strong> if stock levels fall below the minimum threshold.
              </li>
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
};

export default StockManagement;
