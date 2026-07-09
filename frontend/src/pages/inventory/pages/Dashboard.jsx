import React, { useContext } from 'react';
import { InventoryContext } from '../../../context/InventoryContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { 
  Package, AlertTriangle, AlertOctagon, FileText, 
  DollarSign, Activity, CheckCircle, ArrowUpRight 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { items, purchaseOrders, payments, laboratories, stockTransactions } = useContext(InventoryContext);

  // Compute stats
  const totalItems = items.length;
  const availableStock = items.reduce((sum, item) => sum + item.quantity, 0);
  const lowStockItems = items.filter(item => item.quantity > 0 && item.quantity <= item.minStock).length;
  const outOfStockItems = items.filter(item => item.quantity === 0).length;
  const pendingPOs = purchaseOrders.filter(po => po.status === 'Pending').length;
  const pendingPayments = payments.filter(p => p.paymentStatus === 'Unpaid').length;
  
  const duePaymentsTotal = payments
    .filter(p => p.paymentStatus !== 'Paid')
    .reduce((sum, p) => sum + p.balance, 0);
    
  const activeLabs = laboratories.filter(l => l.status === 'Active').length;

  // Monthly material usage (mock sum)
  const monthlyUsage = Math.abs(stockTransactions
    .filter(t => t.type === 'Stock Out' && new Date(t.date).getMonth() === new Date().getMonth())
    .reduce((sum, t) => sum + t.quantity, 0));

  // Recent 5 activities
  const recentActivities = stockTransactions.slice(0, 5);

  // Mock chart coordinates for stock movements
  const points = "10,90 40,65 70,80 100,45 130,55 160,30 190,40 220,15 250,25 280,10";

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-textPrimary tracking-tight">Inventory Dashboard</h1>
        <p className="text-textSecondary text-sm mt-1">Overview of clinical stock, suppliers, and laboratory requirements.</p>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center space-x-4 border-l-4 border-l-blue-600 hover:shadow-md transition-shadow">
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
            <Package size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Total Items</p>
            <p className="text-2xl font-bold text-textPrimary mt-0.5">{totalItems}</p>
            <p className="text-[10px] text-textSecondary mt-1">{availableStock} total units in hand</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center space-x-4 border-l-4 border-l-amber-500 hover:shadow-md transition-shadow">
          <div className="p-3 bg-amber-50 rounded-xl text-amber-500">
            <AlertTriangle size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Low Stock</p>
            <p className="text-2xl font-bold text-textPrimary mt-0.5">{lowStockItems}</p>
            <p className="text-[10px] text-amber-600 font-medium mt-1">Require replenishment</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center space-x-4 border-l-4 border-l-red-500 hover:shadow-md transition-shadow">
          <div className="p-3 bg-red-50 rounded-xl text-red-500">
            <AlertOctagon size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Out of Stock</p>
            <p className="text-2xl font-bold text-textPrimary mt-0.5">{outOfStockItems}</p>
            <p className="text-[10px] text-red-600 font-medium mt-1">Reorder immediately</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center space-x-4 border-l-4 border-l-indigo-600 hover:shadow-md transition-shadow">
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
            <FileText size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Pending Orders</p>
            <p className="text-2xl font-bold text-textPrimary mt-0.5">{pendingPOs}</p>
            <p className="text-[10px] text-textSecondary mt-1">Awaiting delivery</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center space-x-4 border-l-4 border-l-rose-500 hover:shadow-md transition-shadow">
          <div className="p-3 bg-rose-50 rounded-xl text-rose-500">
            <DollarSign size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Pending Payments</p>
            <p className="text-2xl font-bold text-textPrimary mt-0.5">{pendingPayments}</p>
            <p className="text-[10px] text-textSecondary mt-1">Unpaid invoices</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center space-x-4 border-l-4 border-l-emerald-500 hover:shadow-md transition-shadow">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-500">
            <DollarSign size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Due Amount</p>
            <p className="text-2xl font-bold text-textPrimary mt-0.5">${duePaymentsTotal.toFixed(2)}</p>
            <p className="text-[10px] text-rose-600 font-medium mt-1">Outstanding payments</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center space-x-4 border-l-4 border-l-teal-500 hover:shadow-md transition-shadow">
          <div className="p-3 bg-teal-50 rounded-xl text-teal-500">
            <Activity size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Active Labs</p>
            <p className="text-2xl font-bold text-textPrimary mt-0.5">{activeLabs}</p>
            <p className="text-[10px] text-textSecondary mt-1">Assigned inventory items</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center space-x-4 border-l-4 border-l-purple-600 hover:shadow-md transition-shadow">
          <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
            <CheckCircle size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Monthly Usage</p>
            <p className="text-2xl font-bold text-textPrimary mt-0.5">{monthlyUsage}</p>
            <p className="text-[10px] text-purple-600 font-medium mt-1">Items consumed this month</p>
          </div>
        </Card>
      </div>

      {/* Quick Actions & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Charts Column */}
        <Card className="lg:col-span-2 p-6 space-y-6">
          <div>
            <h3 className="font-bold text-lg text-textPrimary">Stock Movement & Consumption Trends</h3>
            <p className="text-xs text-textSecondary">Real-time visualization of stock fluctuations and usage rates.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Stock Movement Chart */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Stock Levels (10-Day Trend)</span>
              <div className="h-44 bg-slate-50 rounded-xl p-4 flex items-end justify-center relative overflow-hidden border border-slate-100">
                <svg viewBox="0 0 300 100" className="w-full h-full text-blue-500 stroke-current fill-none">
                  <path d={`M ${points}`} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  {/* Fill Area */}
                  <path d={`M 10,100 L 10,90 L 40,65 L 70,80 L 100,45 L 130,55 L 160,30 L 190,40 L 220,15 L 250,25 L 280,10 L 280,100 Z`} className="text-blue-100/50 fill-current stroke-none" />
                </svg>
                {/* Horizontal Guide Lines */}
                <div className="absolute inset-x-0 top-1/4 border-b border-dashed border-slate-200 pointer-events-none"></div>
                <div className="absolute inset-x-0 top-2/4 border-b border-dashed border-slate-200 pointer-events-none"></div>
                <div className="absolute inset-x-0 top-3/4 border-b border-dashed border-slate-200 pointer-events-none"></div>
              </div>
            </div>

            {/* Consumption Chart */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Usage By Category</span>
              <div className="h-44 bg-slate-50 rounded-xl p-4 flex flex-col justify-between border border-slate-100">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-textSecondary font-medium">
                    <span>Restorative</span>
                    <span className="text-textPrimary font-semibold">45%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-textSecondary font-medium">
                    <span>Disposable</span>
                    <span className="text-textPrimary font-semibold">30%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '30%' }}></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-textSecondary font-medium">
                    <span>Anesthetics</span>
                    <span className="text-textPrimary font-semibold">15%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: '15%' }}></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-textSecondary font-medium">
                    <span>Other</span>
                    <span className="text-textPrimary font-semibold">10%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: '10%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Actions Card */}
        <Card className="p-6 space-y-4">
          <h3 className="font-bold text-lg text-textPrimary">Quick Actions</h3>
          <div className="flex flex-col space-y-2">
            <Link to="/inventory/items" className="flex items-center justify-between p-3 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-sm font-semibold transition-all">
              <span>Add New Item</span>
              <ArrowUpRight size={18} />
            </Link>
            <Link to="/inventory/stock" className="flex items-center justify-between p-3 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-sm font-semibold transition-all">
              <span>Log Stock Transaction</span>
              <ArrowUpRight size={18} />
            </Link>
            <Link to="/inventory/purchase-orders" className="flex items-center justify-between p-3 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-sm font-semibold transition-all">
              <span>Create Purchase Order</span>
              <ArrowUpRight size={18} />
            </Link>
            <Link to="/inventory/payments" className="flex items-center justify-between p-3 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-sm font-semibold transition-all">
              <span>Record Supplier Payment</span>
              <ArrowUpRight size={18} />
            </Link>
          </div>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg text-textPrimary">Recent Activity Log</h3>
          <Link to="/inventory/stock" className="text-xs text-blue-600 hover:underline font-semibold">View All Transactions</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-textSecondary uppercase tracking-wider">
                <th className="py-2.5">Date</th>
                <th className="py-2.5">Item</th>
                <th className="py-2.5">Activity Type</th>
                <th className="py-2.5">Quantity</th>
                <th className="py-2.5">Reference</th>
                <th className="py-2.5">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentActivities.map((act) => {
                const item = items.find(i => i.id === act.itemId);
                return (
                  <tr key={act.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 text-textSecondary font-medium">
                      {new Date(act.date).toLocaleDateString()} {new Date(act.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 font-semibold text-textPrimary">{item?.name || 'Unknown Item'}</td>
                    <td className="py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        act.type === 'Stock In' ? 'bg-emerald-50 text-emerald-700' :
                        act.type === 'Stock Out' ? 'bg-amber-50 text-amber-700' :
                        act.type === 'Stock Adjustment' ? 'bg-blue-50 text-blue-700' :
                        'bg-slate-50 text-slate-700'
                      }`}>
                        {act.type}
                      </span>
                    </td>
                    <td className={`py-3 font-bold ${act.quantity > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {act.quantity > 0 ? `+${act.quantity}` : act.quantity}
                    </td>
                    <td className="py-3 text-textSecondary">{act.reference}</td>
                    <td className="py-3 text-textSecondary italic">{act.remarks}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
