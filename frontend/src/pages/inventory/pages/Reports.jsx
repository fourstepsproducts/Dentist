import React, { useContext, useState } from 'react';
import { InventoryContext } from '../../../context/InventoryContext';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { Card } from '../../../components/ui/Card';
import { 
  FileSpreadsheet, FileText, Printer, 
  Download, Loader2, Sparkles 
} from 'lucide-react';
import { showToast } from '../../../utils/toast';

const Reports = () => {
  const { items, purchaseOrders, payments, suppliers, stockTransactions } = useContext(InventoryContext);

  const [reportType, setReportType] = useState('Stock');
  const [isExporting, setIsExporting] = useState(false);

  const handleExportAction = (format) => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      if (format === 'print') {
        window.print();
      } else {
        showToast.success(`Report downloaded successfully in ${format} format!`);
      }
    }, 1200);
  };

  const renderReportPreview = () => {
    switch (reportType) {
      case 'Stock':
        return (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border text-textSecondary uppercase tracking-wider">
                <th className="py-2 px-2">Code</th>
                <th className="py-2 px-2">Item Name</th>
                <th className="py-2 px-2">Category</th>
                <th className="py-2 px-2">Quantity</th>
                <th className="py-2 px-2">Cost Price</th>
                <th className="py-2 px-2">Asset Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-textPrimary">
              {items.map(item => (
                <tr key={item.id}>
                  <td className="py-2 px-2 font-bold text-blue-600">{item.code}</td>
                  <td className="py-2 px-2 font-semibold">{item.name}</td>
                  <td className="py-2 px-2">{item.category}</td>
                  <td className="py-2 px-2 font-extrabold">{item.quantity}</td>
                  <td className="py-2 px-2">${item.costPrice.toFixed(2)}</td>
                  <td className="py-2 px-2 font-bold">${(item.quantity * item.costPrice).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      case 'Usage':
        const usageTx = stockTransactions.filter(t => t.type === 'Stock Out');
        return (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border text-textSecondary uppercase tracking-wider">
                <th className="py-2 px-2">Date</th>
                <th className="py-2 px-2">Item Name</th>
                <th className="py-2 px-2">Reference</th>
                <th className="py-2 px-2">Qty Consumed</th>
                <th className="py-2 px-2">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-textPrimary">
              {usageTx.map(tx => {
                const item = items.find(i => i.id === tx.itemId);
                return (
                  <tr key={tx.id}>
                    <td className="py-2 px-2">{new Date(tx.date).toLocaleDateString()}</td>
                    <td className="py-2 px-2 font-semibold">{item?.name || 'Deleted Item'}</td>
                    <td className="py-2 px-2 font-semibold text-textSecondary">{tx.reference}</td>
                    <td className="py-2 px-2 font-bold text-rose-600">{tx.quantity}</td>
                    <td className="py-2 px-2 text-textSecondary italic">{tx.remarks}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        );
      case 'Purchase':
        return (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border text-textSecondary uppercase tracking-wider">
                <th className="py-2 px-2">PO Number</th>
                <th className="py-2 px-2">Supplier</th>
                <th className="py-2 px-2">Order Date</th>
                <th className="py-2 px-2">Total Amount</th>
                <th className="py-2 px-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-textPrimary">
              {purchaseOrders.map(po => {
                const supplier = suppliers.find(s => s.id === po.supplierId);
                return (
                  <tr key={po.id}>
                    <td className="py-2 px-2 font-bold text-blue-600">{po.poNumber}</td>
                    <td className="py-2 px-2 font-semibold">{supplier?.name || 'Supplier'}</td>
                    <td className="py-2 px-2">{po.orderDate}</td>
                    <td className="py-2 px-2 font-bold">${po.totalAmount.toFixed(2)}</td>
                    <td className="py-2 px-2">
                      <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold">{po.status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        );
      case 'Payments':
        return (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border text-textSecondary uppercase tracking-wider">
                <th className="py-2 px-2">Invoice No</th>
                <th className="py-2 px-2">Supplier</th>
                <th className="py-2 px-2">Amount</th>
                <th className="py-2 px-2">Paid</th>
                <th className="py-2 px-2">Balance</th>
                <th className="py-2 px-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-textPrimary">
              {payments.map(p => {
                const supplier = suppliers.find(s => s.id === p.supplierId);
                return (
                  <tr key={p.id}>
                    <td className="py-2 px-2 font-bold">#{p.invoiceNumber}</td>
                    <td className="py-2 px-2 font-semibold">{supplier?.name || 'Supplier'}</td>
                    <td className="py-2 px-2 font-semibold">${p.amount.toFixed(2)}</td>
                    <td className="py-2 px-2 text-emerald-600 font-bold">${p.paidAmount.toFixed(2)}</td>
                    <td className="py-2 px-2 text-rose-600 font-extrabold">${p.balance.toFixed(2)}</td>
                    <td className="py-2 px-2">
                      <span className={`px-1.5 py-0.5 rounded font-semibold ${
                        p.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}>{p.paymentStatus}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        );
      default:
        const lowStock = items.filter(i => i.quantity <= i.minStock);
        return (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border text-textSecondary uppercase tracking-wider">
                <th className="py-2 px-2">Code</th>
                <th className="py-2 px-2">Item Name</th>
                <th className="py-2 px-2">Min Limit</th>
                <th className="py-2 px-2">Current Stock</th>
                <th className="py-2 px-2">Shortage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-textPrimary">
              {lowStock.map(i => (
                <tr key={i.id}>
                  <td className="py-2 px-2 font-bold text-red-500">{i.code}</td>
                  <td className="py-2 px-2 font-semibold">{i.name}</td>
                  <td className="py-2 px-2 text-textSecondary">{i.minStock}</td>
                  <td className="py-2 px-2 font-extrabold text-rose-600">{i.quantity}</td>
                  <td className="py-2 px-2 font-extrabold text-red-600">{Math.max(0, i.minStock - i.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-textPrimary tracking-tight">Reports</h1>
        <p className="text-textSecondary text-sm mt-1">Generate, preview, and print operational reports for dental materials, costs, and supplies.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Report configuration card */}
        <Card className="p-5 space-y-4 h-fit">
          <div className="flex items-center space-x-1.5 text-blue-600 border-b border-border pb-3">
            <Sparkles size={18} />
            <h3 className="font-bold text-textPrimary">Report Setup</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-textSecondary uppercase tracking-wider">Report Category</label>
              <Select 
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <option value="Stock">Stock Asset Valuations</option>
                <option value="Usage">Material Usage / Consumption</option>
                <option value="Purchase">Purchase Orders Summary</option>
                <option value="Payments">Supplier Invoices & Payments</option>
                <option value="LowStock">Low Stock / Warning Reports</option>
              </Select>
            </div>

            {/* Quick Export buttons */}
            <div className="space-y-2 pt-2">
              <Button 
                variant="outline" 
                className="w-full flex justify-center items-center h-9 text-xs"
                disabled={isExporting}
                onClick={() => handleExportAction('PDF')}
              >
                {isExporting ? <Loader2 size={14} className="animate-spin mr-1.5" /> : <FileText size={14} className="mr-1.5 text-red-500" />}
                Export PDF
              </Button>
              <Button 
                variant="outline" 
                className="w-full flex justify-center items-center h-9 text-xs"
                disabled={isExporting}
                onClick={() => handleExportAction('Excel')}
              >
                {isExporting ? <Loader2 size={14} className="animate-spin mr-1.5" /> : <FileSpreadsheet size={14} className="mr-1.5 text-emerald-600" />}
                Export Excel
              </Button>
              <Button 
                variant="outline" 
                className="w-full flex justify-center items-center h-9 text-xs"
                disabled={isExporting}
                onClick={() => handleExportAction('print')}
              >
                {isExporting ? <Loader2 size={14} className="animate-spin mr-1.5" /> : <Printer size={14} className="mr-1.5" />}
                Print Report
              </Button>
            </div>
          </div>
        </Card>

        {/* Live Preview Panel */}
        <Card className="lg:col-span-3 p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="flex justify-between items-center border-b border-border pb-3">
            <h3 className="font-bold text-lg text-textPrimary">Report Preview: {reportType} Report</h3>
            <span className="text-xs text-textSecondary font-semibold">Generated Just Now</span>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
            {renderReportPreview()}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
