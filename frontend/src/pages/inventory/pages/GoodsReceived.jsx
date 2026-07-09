import React, { useContext, useState } from 'react';
import { InventoryContext } from '../../../context/InventoryContext';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Card } from '../../../components/ui/Card';
import { Plus, Search, ShieldCheck, CheckCircle2, Clipboard } from 'lucide-react';

const GoodsReceived = () => {
  const { goodsReceived, receiveGoods, purchaseOrders, suppliers, items } = useContext(InventoryContext);

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [selectedPoNumber, setSelectedPoNumber] = useState('');
  const [receivedBy, setReceivedBy] = useState('');
  const [grnRemarks, setGrnRemarks] = useState('');
  const [receiptItems, setReceiptItems] = useState([]); // [{ itemId, quantityOrdered, quantityReceived, condition, remarks }]

  const handlePoChange = (poNum) => {
    setSelectedPoNumber(poNum);
    const poObj = purchaseOrders.find(p => p.poNumber === poNum);
    if (poObj) {
      setReceiptItems(poObj.items.map(i => ({
        itemId: i.itemId,
        quantityOrdered: i.quantity,
        quantityReceived: i.quantity, // default to fully received
        condition: 'Good',
        remarks: ''
      })));
    } else {
      setReceiptItems([]);
    }
  };

  const handleQtyChange = (index, val) => {
    setReceiptItems(prev => prev.map((item, idx) => 
      idx === index ? { ...item, quantityReceived: Number(val) } : item
    ));
  };

  const handleConditionChange = (index, val) => {
    setReceiptItems(prev => prev.map((item, idx) => 
      idx === index ? { ...item, condition: val } : item
    ));
  };

  const handleItemRemarksChange = (index, val) => {
    setReceiptItems(prev => prev.map((item, idx) => 
      idx === index ? { ...item, remarks: val } : item
    ));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedPoNumber) {
      alert('Please select a purchase order.');
      return;
    }

    const selectedPoObj = purchaseOrders.find(p => p.poNumber === selectedPoNumber);
    if (!selectedPoObj) return;

    receiveGoods({
      poNumber: selectedPoNumber,
      supplierId: selectedPoObj.supplierId,
      receivedBy,
      remarks: grnRemarks,
      items: receiptItems.map(i => ({
        itemId: i.itemId,
        quantityReceived: i.quantityReceived,
        condition: i.condition,
        remarks: i.remarks
      }))
    });

    setIsModalOpen(false);
    setSelectedPoNumber('');
    setReceivedBy('');
    setGrnRemarks('');
    setReceiptItems([]);
    alert('Goods Received Note (GRN) generated. Stock quantities updated.');
  };

  const filtered = goodsReceived.filter(g => {
    const supplier = suppliers.find(s => s.id === g.supplierId);
    return g.grnNumber.toLowerCase().includes(search.toLowerCase()) ||
           g.poNumber.toLowerCase().includes(search.toLowerCase()) ||
           (supplier && supplier.name.toLowerCase().includes(search.toLowerCase()));
  });

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-textPrimary tracking-tight">Goods Received</h1>
          <p className="text-textSecondary text-sm mt-1">Track and generate Goods Received Notes (GRN) to verify supplier deliveries against orders.</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)} 
          disabled={purchaseOrders.filter(p => p.status === 'Pending').length === 0}
          size="sm"
        >
          <Plus size={16} className="mr-2" /> Log Received Goods
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4 flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-textSecondary" size={18} />
          <Input 
            placeholder="Search by GRN code, PO number, or supplier..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* GRN List */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-textSecondary uppercase tracking-wider">
                <th className="py-3 px-4">GRN Number</th>
                <th className="py-3 px-4">PO Link</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Received Date</th>
                <th className="py-3 px-4">Received By</th>
                <th className="py-3 px-4 text-center">Items Received</th>
                <th className="py-3 px-4">Condition</th>
                <th className="py-3 px-4">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((grn) => {
                const supplier = suppliers.find(s => s.id === grn.supplierId);
                const totalQty = grn.items.reduce((sum, i) => sum + i.quantityReceived, 0);
                
                return (
                  <tr key={grn.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4 font-bold text-blue-600 inline-flex items-center gap-2">
                      <ShieldCheck size={16} className="text-emerald-500" />
                      {grn.grnNumber}
                    </td>
                    <td className="py-4 px-4 font-semibold text-textSecondary">{grn.poNumber}</td>
                    <td className="py-4 px-4 font-semibold text-textPrimary">{supplier?.name || 'Unknown Vendor'}</td>
                    <td className="py-4 px-4 text-textSecondary font-semibold">
                      {new Date(grn.receivedDate).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 text-textSecondary font-semibold">{grn.receivedBy}</td>
                    <td className="py-4 px-4 text-center font-bold text-textPrimary">{totalQty} units</td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                        <CheckCircle2 size={12} />
                        Good
                      </span>
                    </td>
                    <td className="py-4 px-4 text-textSecondary italic text-xs max-w-xs truncate">{grn.remarks || '-'}</td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-textSecondary">
                    No Goods Received Notes (GRN) logged yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Log Goods Received Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-3xl bg-white p-6 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h3 className="font-bold text-lg text-textPrimary flex items-center gap-2">
                <Clipboard size={20} className="text-primary" /> Create Goods Received Note (GRN)
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-textSecondary hover:text-textPrimary text-xl font-bold">×</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-textPrimary">Select Pending Purchase Order *</label>
                  <Select
                    value={selectedPoNumber}
                    onChange={(e) => handlePoChange(e.target.value)}
                    required
                  >
                    <option value="">Select PO</option>
                    {purchaseOrders.filter(p => p.status === 'Pending').map(p => (
                      <option key={p.id} value={p.poNumber}>{p.poNumber} - ${p.totalAmount.toFixed(2)}</option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-textPrimary">Received By (Staff Name) *</label>
                  <Input 
                    value={receivedBy}
                    onChange={(e) => setReceivedBy(e.target.value)}
                    placeholder="Enter your name"
                    required
                  />
                </div>
              </div>

              {/* Items Table details */}
              {receiptItems.length > 0 && (
                <div className="space-y-3">
                  <span className="text-sm font-bold text-textPrimary uppercase tracking-wider block">Verify Received Quantities</span>
                  
                  <div className="space-y-3">
                    {receiptItems.map((row, idx) => {
                      const itemObj = items.find(i => i.id === row.itemId);
                      return (
                        <div key={idx} className="flex flex-col sm:flex-row gap-3 items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                          <div className="w-full sm:flex-1">
                            <span className="text-xs font-semibold text-textSecondary block">Item Name</span>
                            <span className="font-bold text-sm text-textPrimary block mt-1">{itemObj?.name || 'Item'}</span>
                            <span className="text-[10px] text-textSecondary block">{itemObj?.code}</span>
                          </div>

                          <div className="w-full sm:w-28 text-center">
                            <span className="text-xs font-semibold text-textSecondary block">Ordered Qty</span>
                            <span className="font-bold text-sm text-textPrimary block mt-1">{row.quantityOrdered}</span>
                          </div>

                          <div className="w-full sm:w-28">
                            <label className="text-xs font-semibold text-textSecondary">Received Qty *</label>
                            <Input 
                              type="number"
                              value={row.quantityReceived}
                              onChange={(e) => handleQtyChange(idx, e.target.value)}
                              max={row.quantityOrdered}
                              min="0"
                              required
                            />
                          </div>

                          <div className="w-full sm:w-36">
                            <label className="text-xs font-semibold text-textSecondary">Condition *</label>
                            <Select
                              value={row.condition}
                              onChange={(e) => handleConditionChange(idx, e.target.value)}
                            >
                              <option value="Good">Good</option>
                              <option value="Damaged">Damaged</option>
                              <option value="Shortage">Shortage</option>
                            </Select>
                          </div>

                          <div className="w-full sm:flex-1">
                            <label className="text-xs font-semibold text-textSecondary">Inspection Remarks</label>
                            <Input 
                              value={row.remarks}
                              onChange={(e) => handleItemRemarksChange(idx, e.target.value)}
                              placeholder="e.g. sealed packaging"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-textPrimary">Overall Remarks</label>
                <textarea 
                  value={grnRemarks}
                  onChange={(e) => setGrnRemarks(e.target.value)}
                  placeholder="Provide overall delivery or delivery driver details..."
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-[3px] focus:ring-blue-600/20 focus:border-blue-600"
                  rows="2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit">Verify & Update Stock</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default GoodsReceived;
