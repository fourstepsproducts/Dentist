import React, { useContext, useState } from 'react';
import { InventoryContext } from '../../../context/InventoryContext';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Card } from '../../../components/ui/Card';
import { Plus, Search, DollarSign, CheckCircle2, ShieldAlert } from 'lucide-react';

const SupplierPayments = () => {
  const { payments, addPayment, suppliers } = useContext(InventoryContext);

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');

  const handleInvoiceChange = (invNum) => {
    setInvoiceNumber(invNum);
    const invoiceObj = payments.find(p => p.invoiceNumber === invNum);
    if (invoiceObj) {
      setAmountPaid(invoiceObj.balance); // default to pay off full balance
    }
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    const invoiceObj = payments.find(p => p.invoiceNumber === invoiceNumber);
    if (!invoiceObj) return;

    const amt = Number(amountPaid);
    if (amt <= 0 || amt > invoiceObj.balance) {
      alert(`Invalid payment amount. Balance is $${invoiceObj.balance}.`);
      return;
    }

    addPayment({
      invoiceNumber,
      amountPaid: amt,
      paymentMethod
    });

    setIsModalOpen(false);
    setInvoiceNumber('');
    setAmountPaid('');
    alert('Payment recorded successfully.');
  };

  const filtered = payments.filter(p => {
    const supplier = suppliers.find(s => s.id === p.supplierId);
    return p.invoiceNumber.toLowerCase().includes(search.toLowerCase()) || 
           (supplier && supplier.name.toLowerCase().includes(search.toLowerCase()));
  });

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-textPrimary tracking-tight">Supplier Payments</h1>
          <p className="text-textSecondary text-sm mt-1">Manage vendor payments, record invoice clearances, and audit payout logs.</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          disabled={payments.filter(p => p.paymentStatus !== 'Paid').length === 0}
          size="sm"
        >
          <Plus size={16} className="mr-2" /> Log Payout
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4 flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-textSecondary" size={18} />
          <Input 
            placeholder="Search by invoice number or vendor..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Payments list table */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-textSecondary uppercase tracking-wider">
                <th className="py-3 px-4">Invoice ID</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Invoice Amount</th>
                <th className="py-3 px-4">Amount Paid</th>
                <th className="py-3 px-4">Outstanding Balance</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((p) => {
                const supplier = suppliers.find(s => s.id === p.supplierId);
                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4 font-bold text-blue-600">#{p.invoiceNumber}</td>
                    <td className="py-4 px-4 font-semibold text-textPrimary">{supplier?.name || 'Unknown Supplier'}</td>
                    <td className="py-4 px-4 font-semibold text-textPrimary">${p.amount.toFixed(2)}</td>
                    <td className="py-4 px-4 font-bold text-emerald-600">${p.paidAmount.toFixed(2)}</td>
                    <td className="py-4 px-4">
                      {p.balance > 0 ? (
                        <span className="font-extrabold text-rose-600">${p.balance.toFixed(2)}</span>
                      ) : (
                        <span className="text-emerald-600 font-semibold">$0.00</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-textSecondary font-semibold">{p.dueDate}</td>
                    <td className="py-4 px-4 text-textSecondary font-semibold">{p.paymentMethod}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                        p.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        p.paymentStatus === 'Partially Paid' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                        'bg-red-50 text-red-700 border-red-100'
                      }`}>
                        {p.paymentStatus === 'Paid' ? <CheckCircle2 size={12} /> : <ShieldAlert size={12} />}
                        {p.paymentStatus}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-textSecondary">
                    No supplier invoice payouts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Record Payout Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-white p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h3 className="font-bold text-lg text-textPrimary flex items-center gap-2">
                <DollarSign size={20} className="text-primary" /> Record Supplier Payout
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-textSecondary hover:text-textPrimary text-xl font-bold">×</button>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-textPrimary">Select Outstanding Invoice *</label>
                <Select
                  value={invoiceNumber}
                  onChange={(e) => handleInvoiceChange(e.target.value)}
                  required
                >
                  <option value="">Select Invoice</option>
                  {payments.filter(p => p.paymentStatus !== 'Paid').map(p => {
                    const vendor = suppliers.find(s => s.id === p.supplierId);
                    return (
                      <option key={p.id} value={p.invoiceNumber}>
                        INV #{p.invoiceNumber} ({vendor?.name}) - Bal: ${p.balance.toFixed(2)}
                      </option>
                    );
                  })}
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-textPrimary">Payment Method *</label>
                <Select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  required
                >
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Cash">Cash</option>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-textPrimary">Amount to Pay ($) *</label>
                <Input 
                  type="number"
                  step="0.01"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit">Submit Payment</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SupplierPayments;
