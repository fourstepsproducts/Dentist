import React, { useContext, useState } from 'react';
import { InventoryContext } from '../../../context/InventoryContext';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { BellRing, CalendarClock, DollarSign, Send, ShieldAlert } from 'lucide-react';

const DuePayments = () => {
  const { payments, suppliers } = useContext(InventoryContext);

  const [filter, setFilter] = useState('All'); // 'All', 'Today', 'Week', 'Month', 'Overdue'

  const unpaid = payments.filter(p => p.paymentStatus !== 'Paid');

  const getFilteredPayments = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const today = new Date(todayStr);

    return unpaid.filter(p => {
      const dueDate = new Date(p.dueDate);
      const diffTime = dueDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (filter === 'Today') {
        return p.dueDate === todayStr;
      }
      if (filter === 'Week') {
        return diffDays >= 0 && diffDays <= 7;
      }
      if (filter === 'Month') {
        return diffDays >= 0 && diffDays <= 30;
      }
      if (filter === 'Overdue') {
        return diffDays < 0;
      }
      return true;
    });
  };

  const handleReminder = (invoiceNum) => {
    alert(`Payment reminder notification sent successfully to supplier for Invoice #${invoiceNum}!`);
  };

  const displayList = getFilteredPayments();

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-textPrimary tracking-tight">Due Payments</h1>
          <p className="text-textSecondary text-sm mt-1">Audit outstanding balances due to suppliers and execute payment notification reminders.</p>
        </div>
        
        {/* Timeline Filter */}
        <div className="flex bg-slate-100 p-1 rounded-xl w-fit text-xs font-bold">
          {['All', 'Today', 'Week', 'Month', 'Overdue'].map((f) => (
            <button 
              key={f}
              onClick={() => setFilter(f)} 
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter === f ? 'bg-white text-textPrimary shadow-sm' : 'text-textSecondary hover:text-textPrimary'
              }`}
            >
              {f === 'Overdue' && <ShieldAlert size={12} className="inline mr-1 text-rose-500" />}
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-red-50 border-red-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-red-800 uppercase tracking-wider block">Overdue Outstanding</span>
            <span className="text-2xl font-extrabold text-red-700 mt-1">
              ${unpaid.filter(p => new Date(p.dueDate) < new Date()).reduce((sum, p) => sum + p.balance, 0).toFixed(2)}
            </span>
          </div>
          <div className="p-3 bg-red-100 text-red-600 rounded-xl">
            <ShieldAlert size={20} />
          </div>
        </Card>

        <Card className="p-4 bg-amber-50 border-amber-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">Due This Week</span>
            <span className="text-2xl font-extrabold text-amber-700 mt-1">
              ${unpaid.filter(p => {
                const diff = (new Date(p.dueDate) - new Date()) / (1000 * 60 * 60 * 24);
                return diff >= 0 && diff <= 7;
              }).reduce((sum, p) => sum + p.balance, 0).toFixed(2)}
            </span>
          </div>
          <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
            <CalendarClock size={20} />
          </div>
        </Card>

        <Card className="p-4 bg-blue-50 border-blue-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-blue-800 uppercase tracking-wider block">Total Outstanding Balance</span>
            <span className="text-2xl font-extrabold text-blue-700 mt-1">
              ${unpaid.reduce((sum, p) => sum + p.balance, 0).toFixed(2)}
            </span>
          </div>
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
            <DollarSign size={20} />
          </div>
        </Card>
      </div>

      {/* Due list card */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-textSecondary uppercase tracking-wider">
                <th className="py-3 px-4">Invoice ID</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Invoice Amount</th>
                <th className="py-3 px-4">Remaining Balance</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Timeline Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {displayList.map((p) => {
                const supplier = suppliers.find(s => s.id === p.supplierId);
                const isOverdue = new Date(p.dueDate) < new Date();
                
                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4 font-bold text-blue-600">#{p.invoiceNumber}</td>
                    <td className="py-4 px-4 font-semibold text-textPrimary">{supplier?.name}</td>
                    <td className="py-4 px-4 font-medium text-textPrimary">${p.amount.toFixed(2)}</td>
                    <td className="py-4 px-4 font-extrabold text-rose-600">${p.balance.toFixed(2)}</td>
                    <td className="py-4 px-4 font-semibold text-textSecondary">{p.dueDate}</td>
                    <td className="py-4 px-4">
                      {isOverdue ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-100 animate-pulse">
                          Overdue
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-primary hover:bg-primary/5 border-primary/20 h-8 text-xs font-bold"
                        onClick={() => handleReminder(p.invoiceNumber)}
                      >
                        <BellRing size={12} className="mr-1.5" /> Remind
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {displayList.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-textSecondary">
                    No outstanding payouts found.
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

export default DuePayments;
