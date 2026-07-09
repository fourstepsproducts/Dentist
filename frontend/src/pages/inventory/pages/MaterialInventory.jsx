import React, { useContext } from 'react';
import { InventoryContext } from '../../../context/InventoryContext';
import { Card } from '../../../components/ui/Card';
import { 
  DollarSign, TrendingUp, Calendar, AlertOctagon, 
  Tag, Percent, RefreshCw 
} from 'lucide-react';

const MaterialInventory = () => {
  const { items } = useContext(InventoryContext);

  // Computations
  const totalItems = items.length;
  
  // Total cost valuation = Sum of (Qty * Cost Price)
  const totalCostValuation = items.reduce((sum, item) => sum + (item.quantity * item.costPrice), 0);
  
  // Total retail valuation = Sum of (Qty * Selling Price)
  const totalRetailValuation = items.reduce((sum, item) => sum + (item.quantity * item.sellingPrice), 0);
  
  // Potential Profit
  const potentialProfit = totalRetailValuation - totalCostValuation;
  
  // Average markup percentage
  const avgMarkup = totalCostValuation > 0 ? (potentialProfit / totalCostValuation) * 100 : 0;

  // Expiry tracker (items that have an expiry date that is not N/A)
  const expiringItems = items
    .filter(item => item.expiryDate !== 'N/A')
    .map(item => {
      const daysLeft = Math.ceil((new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
      return { ...item, daysLeft };
    })
    .sort((a, b) => a.daysLeft - b.daysLeft);

  // Group items by category for allocation summary
  const categories = [...new Set(items.map(i => i.category))];
  const categorySummary = categories.map(cat => {
    const catItems = items.filter(i => i.category === cat);
    const qty = catItems.reduce((sum, i) => sum + i.quantity, 0);
    const val = catItems.reduce((sum, i) => sum + (i.quantity * i.costPrice), 0);
    return { name: cat, count: catItems.length, quantity: qty, valuation: val };
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-textPrimary tracking-tight">Material & Inventory Management</h1>
        <p className="text-textSecondary text-sm mt-1">Detailed evaluation of inventory asset value, markup metrics, and product shelf life.</p>
      </div>

      {/* Grid of Valuation Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex items-center justify-between border-l-4 border-l-blue-600">
          <div className="space-y-1">
            <span className="text-xs font-bold text-textSecondary uppercase tracking-wider block">Asset Cost Value</span>
            <span className="text-2xl font-extrabold text-textPrimary">${totalCostValuation.toFixed(2)}</span>
            <span className="block text-[10px] text-textSecondary font-semibold">Total investment in stock</span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <DollarSign size={22} />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between border-l-4 border-l-emerald-500">
          <div className="space-y-1">
            <span className="text-xs font-bold text-textSecondary uppercase tracking-wider block">Retail Sale Value</span>
            <span className="text-2xl font-extrabold text-emerald-600">${totalRetailValuation.toFixed(2)}</span>
            <span className="block text-[10px] text-emerald-600 font-semibold">Expected revenue potential</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-50 rounded-xl">
            <TrendingUp size={22} className="text-emerald-600" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between border-l-4 border-l-purple-600">
          <div className="space-y-1">
            <span className="text-xs font-bold text-textSecondary uppercase tracking-wider block">Unrealized Profit</span>
            <span className="text-2xl font-extrabold text-purple-700">${potentialProfit.toFixed(2)}</span>
            <span className="block text-[10px] text-purple-600 font-semibold">Projected profit margin</span>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Percent size={22} />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between border-l-4 border-l-amber-500">
          <div className="space-y-1">
            <span className="text-xs font-bold text-textSecondary uppercase tracking-wider block">Average Markup</span>
            <span className="text-2xl font-extrabold text-amber-700">{avgMarkup.toFixed(1)}%</span>
            <span className="block text-[10px] text-amber-600 font-semibold">Average item markup rate</span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Tag size={22} />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Allocation Summary */}
        <Card className="lg:col-span-2 p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-border pb-3">
            <h3 className="font-bold text-lg text-textPrimary">Category Asset Allocation</h3>
            <span className="text-xs text-textSecondary font-semibold">Valuations by Department</span>
          </div>

          <div className="space-y-4">
            {categorySummary.map((cat) => {
              const valPercent = totalCostValuation > 0 ? (cat.valuation / totalCostValuation) * 100 : 0;
              return (
                <div key={cat.name} className="space-y-2">
                  <div className="flex justify-between items-center text-sm font-semibold">
                    <span className="text-textPrimary">{cat.name} ({cat.count} items)</span>
                    <span className="text-textSecondary">
                      ${cat.valuation.toFixed(2)} <span className="text-xs font-medium">({valPercent.toFixed(1)}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${valPercent}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Expiry Tracking */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center space-x-2 border-b border-border pb-3">
            <Calendar size={18} className="text-rose-500" />
            <h3 className="font-bold text-lg text-textPrimary">Product Shelf-Life Track</h3>
          </div>

          <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
            {expiringItems.map(item => {
              let tagColor = 'bg-emerald-50 text-emerald-700';
              if (item.daysLeft <= 30) tagColor = 'bg-red-50 text-red-700 animate-pulse';
              else if (item.daysLeft <= 90) tagColor = 'bg-amber-50 text-amber-700';

              return (
                <div key={item.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center text-xs">
                  <div className="space-y-0.5">
                    <span className="font-bold text-textPrimary block">{item.name}</span>
                    <span className="text-textSecondary block">Exp: {item.expiryDate}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-lg font-bold border ${tagColor}`}>
                    {item.daysLeft <= 0 ? 'Expired' : `${item.daysLeft} days`}
                  </span>
                </div>
              );
            })}
            {expiringItems.length === 0 && (
              <p className="text-xs text-textSecondary italic text-center py-6">No expiration dates configured for stock.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MaterialInventory;
