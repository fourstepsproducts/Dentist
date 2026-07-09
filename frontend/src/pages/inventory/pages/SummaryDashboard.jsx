import React, { useContext } from 'react';
import { InventoryContext } from '../../../context/InventoryContext';
import { Card } from '../../../components/ui/Card';
import { BarChart, DollarSign, Package, Users, Truck, AlertTriangle } from 'lucide-react';

const SummaryDashboard = () => {
  const { items, purchaseOrders, payments, suppliers, stockTransactions } = useContext(InventoryContext);

  // Compute metrics
  const totalSuppliers = suppliers.length;
  const pendingOrders = purchaseOrders.filter(po => po.status === 'Pending').length;
  const lowStockCount = items.filter(i => i.quantity <= i.minStock).length;
  
  const currentInvValue = items.reduce((sum, item) => sum + (item.quantity * item.costPrice), 0);
  
  const monthlyPurchases = purchaseOrders
    .filter(po => new Date(po.orderDate).getMonth() === new Date().getMonth())
    .reduce((sum, po) => sum + po.totalAmount, 0);

  const monthlyPayments = payments
    .filter(p => p.paymentStatus !== 'Paid')
    .reduce((sum, p) => sum + p.balance, 0);

  // Consumption analysis (top consumed materials based on Stock Out logs)
  const consumedMap = {};
  stockTransactions
    .filter(t => t.type === 'Stock Out')
    .forEach(t => {
      consumedMap[t.itemId] = (consumedMap[t.itemId] || 0) + Math.abs(t.quantity);
    });

  const topConsumed = Object.entries(consumedMap)
    .map(([itemId, qty]) => {
      const itemObj = items.find(i => i.id === Number(itemId));
      return { name: itemObj?.name || 'Unknown', quantity: qty, val: qty * (itemObj?.costPrice || 0) };
    })
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-textPrimary tracking-tight">Summary Dashboard</h1>
        <p className="text-textSecondary text-sm mt-1">Overall analytics, monthly spending summaries, consumption breakdown, and visual charts.</p>
      </div>

      {/* Grid overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex items-center justify-between border-l-4 border-l-blue-600">
          <div>
            <span className="text-xs font-bold text-textSecondary uppercase tracking-wider block">Monthly Purchases</span>
            <span className="text-2xl font-extrabold text-textPrimary mt-1">${monthlyPurchases.toFixed(2)}</span>
            <span className="block text-[10px] text-textSecondary font-semibold">Orders placed this month</span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <DollarSign size={20} />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between border-l-4 border-l-emerald-500">
          <div>
            <span className="text-xs font-bold text-textSecondary uppercase tracking-wider block">Inventory Valuation</span>
            <span className="text-2xl font-extrabold text-emerald-600 mt-1">${currentInvValue.toFixed(2)}</span>
            <span className="block text-[10px] text-emerald-600 font-semibold">Current stock worth</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Package size={20} />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between border-l-4 border-l-indigo-600">
          <div>
            <span className="text-xs font-bold text-textSecondary uppercase tracking-wider block">Total Suppliers</span>
            <span className="text-2xl font-extrabold text-indigo-700 mt-1">{totalSuppliers} Vendors</span>
            <span className="block text-[10px] text-indigo-600 font-semibold">Registered active suppliers</span>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Users size={20} />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between border-l-4 border-l-rose-500">
          <div>
            <span className="text-xs font-bold text-textSecondary uppercase tracking-wider block">Unpaid Bills</span>
            <span className="text-2xl font-extrabold text-rose-600 mt-1">${monthlyPayments.toFixed(2)}</span>
            <span className="block text-[10px] text-rose-600 font-semibold">Pending payments due</span>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <AlertTriangle size={20} />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts: Purchases vs Consumption */}
        <Card className="lg:col-span-2 p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-border pb-3">
            <h3 className="font-bold text-lg text-textPrimary">Purchases vs Consumption</h3>
            <span className="text-xs text-textSecondary font-semibold">6-Month Trend Overview</span>
          </div>

          <div className="h-56 bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-end justify-between relative overflow-hidden">
            {/* Visual Bar representation */}
            <div className="flex flex-col items-center space-y-2 z-10">
              <div className="flex space-x-1.5 items-end h-36">
                <div className="w-4 bg-blue-500 rounded-t h-[40px]" title="Purchases: $400"></div>
                <div className="w-4 bg-emerald-500 rounded-t h-[60px]" title="Consumption: $600"></div>
              </div>
              <span className="text-2xs font-semibold text-textSecondary">Jan</span>
            </div>

            <div className="flex flex-col items-center space-y-2 z-10">
              <div className="flex space-x-1.5 items-end h-36">
                <div className="w-4 bg-blue-500 rounded-t h-[95px]" title="Purchases: $950"></div>
                <div className="w-4 bg-emerald-500 rounded-t h-[50px]" title="Consumption: $500"></div>
              </div>
              <span className="text-2xs font-semibold text-textSecondary">Feb</span>
            </div>

            <div className="flex flex-col items-center space-y-2 z-10">
              <div className="flex space-x-1.5 items-end h-36">
                <div className="w-4 bg-blue-500 rounded-t h-[70px]" title="Purchases: $700"></div>
                <div className="w-4 bg-emerald-500 rounded-t h-[80px]" title="Consumption: $800"></div>
              </div>
              <span className="text-2xs font-semibold text-textSecondary">Mar</span>
            </div>

            <div className="flex flex-col items-center space-y-2 z-10">
              <div className="flex space-x-1.5 items-end h-36">
                <div className="w-4 bg-blue-500 rounded-t h-[110px]" title="Purchases: $1100"></div>
                <div className="w-4 bg-emerald-500 rounded-t h-[65px]" title="Consumption: $650"></div>
              </div>
              <span className="text-2xs font-semibold text-textSecondary">Apr</span>
            </div>

            <div className="flex flex-col items-center space-y-2 z-10">
              <div className="flex space-x-1.5 items-end h-36">
                <div className="w-4 bg-blue-500 rounded-t h-[85px]" title="Purchases: $850"></div>
                <div className="w-4 bg-emerald-500 rounded-t h-[90px]" title="Consumption: $90"></div>
              </div>
              <span className="text-2xs font-semibold text-textSecondary">May</span>
            </div>

            <div className="flex flex-col items-center space-y-2 z-10">
              <div className="flex space-x-1.5 items-end h-36">
                <div className="w-4 bg-blue-500 rounded-t h-[120px]" title="Purchases: $1200"></div>
                <div className="w-4 bg-emerald-500 rounded-t h-[105px]" title="Consumption: $1050"></div>
              </div>
              <span className="text-2xs font-semibold text-textSecondary">Jun</span>
            </div>

            {/* Grid Helper lines */}
            <div className="absolute inset-x-0 bottom-1/4 border-b border-dashed border-slate-200 pointer-events-none"></div>
            <div className="absolute inset-x-0 bottom-2/4 border-b border-dashed border-slate-200 pointer-events-none"></div>
            <div className="absolute inset-x-0 bottom-3/4 border-b border-dashed border-slate-200 pointer-events-none"></div>
          </div>
          <div className="flex justify-center space-x-8 text-xs font-bold">
            <span className="flex items-center gap-1.5 text-blue-600"><span className="w-3 h-3 bg-blue-500 rounded"></span> Purchases ($)</span>
            <span className="flex items-center gap-1.5 text-emerald-600"><span className="w-3 h-3 bg-emerald-500 rounded"></span> Consumption ($)</span>
          </div>
        </Card>

        {/* Top Consumed Materials */}
        <Card className="p-6 space-y-4">
          <div className="border-b border-border pb-3 flex items-center space-x-2">
            <BarChart size={18} className="text-blue-600" />
            <h3 className="font-bold text-lg text-textPrimary">Top Consumed Materials</h3>
          </div>

          <div className="space-y-4">
            {topConsumed.map((item, idx) => (
              <div key={idx} className="space-y-1.5 text-xs font-semibold">
                <div className="flex justify-between items-center text-textPrimary">
                  <span>{item.name}</span>
                  <span>{item.quantity} units consumed</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, item.quantity * 8)}%` }}></div>
                </div>
              </div>
            ))}
            {topConsumed.length === 0 && (
              <p className="text-xs text-textSecondary italic text-center py-10">No stock consumption logs logged yet.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SummaryDashboard;
