import React, { useContext, useState } from 'react';
import { InventoryContext } from '../../../context/InventoryContext';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Card } from '../../../components/ui/Card';
import { Plus, Search, FileText, Trash, ShoppingBag, DollarSign } from 'lucide-react';
import { showToast } from '../../../utils/toast';

const PurchaseOrders = () => {
  const { purchaseOrders, addPurchaseOrder, suppliers, items, settings } = useContext(InventoryContext);

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // PO Form states
  const [supplierId, setSupplierId] = useState('');
  const [expectedDelivery, setExpectedDelivery] = useState('');
  const [selectedItems, setSelectedItems] = useState([
    { itemId: '', quantity: 1, costPrice: 0 }
  ]);

  const handleAddItemRow = () => {
    setSelectedItems(prev => [...prev, { itemId: '', quantity: 1, costPrice: 0 }]);
  };

  const handleRemoveItemRow = (index) => {
    setSelectedItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleItemSelect = (index, itemId) => {
    const selectedItemObj = items.find(i => i.id === Number(itemId));
    setSelectedItems(prev => prev.map((itemRow, i) => {
      if (i === index) {
        return {
          ...itemRow,
          itemId,
          costPrice: selectedItemObj ? selectedItemObj.costPrice : 0
        };
      }
      return itemRow;
    }));
  };

  const handleQtyChange = (index, qty) => {
    setSelectedItems(prev => prev.map((itemRow, i) => {
      if (i === index) {
        return { ...itemRow, quantity: Number(qty) };
      }
      return itemRow;
    }));
  };

  const handlePriceChange = (index, price) => {
    setSelectedItems(prev => prev.map((itemRow, i) => {
      if (i === index) {
        return { ...itemRow, costPrice: Number(price) };
      }
      return itemRow;
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedItems.some(i => !i.itemId || i.quantity <= 0)) {
      showToast.warning('Please fill out all selected items and positive quantities.');
      return;
    }

    addPurchaseOrder({
      supplierId: Number(supplierId),
      expectedDelivery,
      items: selectedItems.map(i => ({
        itemId: Number(i.itemId),
        quantity: Number(i.quantity),
        costPrice: Number(i.costPrice)
      }))
    });

    setIsModalOpen(false);
    // Reset Form
    setSupplierId('');
    setExpectedDelivery('');
    setSelectedItems([{ itemId: '', quantity: 1, costPrice: 0 }]);
    showToast.success('Purchase Order created successfully.');
  };

  // Compute PO subtotals
  const subtotal = selectedItems.reduce((sum, row) => sum + (row.quantity * row.costPrice), 0);
  const tax = settings.taxSettings.applyTaxOnPO ? (subtotal * settings.taxSettings.gstRate) / 100 : 0;
  const grandTotal = subtotal + tax;

  const filtered = purchaseOrders.filter(po => {
    const supplier = suppliers.find(s => s.id === po.supplierId);
    return po.poNumber.toLowerCase().includes(search.toLowerCase()) || 
           (supplier && supplier.name.toLowerCase().includes(search.toLowerCase()));
  });

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-textPrimary tracking-tight">Purchase Orders</h1>
          <p className="text-textSecondary text-sm mt-1">Generate and monitor purchase orders sent to vendors.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} size="sm">
          <Plus size={16} className="mr-2" /> Create Purchase Order
        </Button>
      </div>

      {/* Filter and Search */}
      <Card className="p-4 flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-textSecondary" size={18} />
          <Input 
            placeholder="Search by PO number or vendor..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* PO List */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-textSecondary uppercase tracking-wider">
                <th className="py-3 px-4">PO Number</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Order Date</th>
                <th className="py-3 px-4">Expected Delivery</th>
                <th className="py-3 px-4">Items Count</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Order Status</th>
                <th className="py-3 px-4">Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((po) => {
                const supplier = suppliers.find(s => s.id === po.supplierId);
                return (
                  <tr key={po.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4 font-bold text-blue-600 inline-flex items-center gap-2">
                      <FileText size={16} />
                      {po.poNumber}
                    </td>
                    <td className="py-4 px-4 font-semibold text-textPrimary">{supplier?.name || 'Unknown Supplier'}</td>
                    <td className="py-4 px-4 text-textSecondary font-semibold">{po.orderDate}</td>
                    <td className="py-4 px-4 text-textSecondary font-semibold">{po.expectedDelivery}</td>
                    <td className="py-4 px-4 font-bold text-textPrimary text-center">
                      {po.items.length} {po.items.length === 1 ? 'item' : 'items'}
                    </td>
                    <td className="py-4 px-4 font-extrabold text-textPrimary">${po.totalAmount.toFixed(2)}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        po.status === 'Pending' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                        po.status === 'Received' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        'bg-slate-50 text-slate-700'
                      }`}>
                        {po.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        po.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        po.paymentStatus === 'Partially Paid' ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                        'bg-rose-50 text-rose-700 border border-rose-100'
                      }`}>
                        {po.paymentStatus}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-textSecondary">
                    No purchase orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* PO Builder Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-3xl bg-white p-6 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h3 className="font-bold text-lg text-textPrimary flex items-center gap-2">
                <ShoppingBag size={20} className="text-primary" /> Generate Purchase Order
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-textSecondary hover:text-textPrimary text-xl font-bold">×</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-textPrimary">Select Supplier *</label>
                  <Select
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    required
                  >
                    <option value="">Choose Vendor</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.paymentTerms})</option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-textPrimary">Expected Delivery Date *</label>
                  <Input 
                    type="date"
                    value={expectedDelivery}
                    onChange={(e) => setExpectedDelivery(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Items grid selector */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-border pb-2">
                  <span className="text-sm font-bold text-textPrimary uppercase tracking-wider">Purchase Items</span>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddItemRow}>
                    <Plus size={14} className="mr-1" /> Add Item
                  </Button>
                </div>

                <div className="space-y-3">
                  {selectedItems.map((row, index) => (
                    <div key={index} className="flex flex-col sm:flex-row gap-3 items-center bg-slate-50 p-3 rounded-xl border border-slate-100 relative">
                      <div className="w-full sm:flex-1 space-y-1">
                        <label className="text-xs font-semibold text-textSecondary">Select Item *</label>
                        <Select
                          value={row.itemId}
                          onChange={(e) => handleItemSelect(index, e.target.value)}
                          required
                        >
                          <option value="">Select Item</option>
                          {items.map(i => (
                            <option key={i.id} value={i.id}>{i.name} ({i.code})</option>
                          ))}
                        </Select>
                      </div>

                      <div className="w-full sm:w-28 space-y-1">
                        <label className="text-xs font-semibold text-textSecondary">Quantity *</label>
                        <Input 
                          type="number"
                          value={row.quantity}
                          onChange={(e) => handleQtyChange(index, e.target.value)}
                          min="1"
                          required
                        />
                      </div>

                      <div className="w-full sm:w-32 space-y-1">
                        <label className="text-xs font-semibold text-textSecondary">Unit Price ($) *</label>
                        <Input 
                          type="number"
                          step="0.01"
                          value={row.costPrice}
                          onChange={(e) => handlePriceChange(index, e.target.value)}
                          required
                        />
                      </div>

                      {selectedItems.length > 1 && (
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleRemoveItemRow(index)}
                          className="sm:mt-5 text-rose-600 hover:bg-rose-50"
                        >
                          <Trash size={16} />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing breakdown */}
              <div className="flex justify-end">
                <div className="w-72 bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2 text-sm font-semibold">
                  <div className="flex justify-between text-textSecondary">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  {settings.taxSettings.applyTaxOnPO && (
                    <div className="flex justify-between text-textSecondary border-b border-border pb-2">
                      <span>GST ({settings.taxSettings.gstRate}%):</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-textPrimary text-base font-extrabold pt-1">
                    <span>Total Amount:</span>
                    <span className="text-primary">${grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Form buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit">Submit Purchase Order</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrders;
