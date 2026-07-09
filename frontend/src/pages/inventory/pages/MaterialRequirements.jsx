import React, { useContext, useState } from 'react';
import { InventoryContext } from '../../../context/InventoryContext';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Select } from '../../../components/ui/Select';
import { Input } from '../../../components/ui/Input';
import { 
  CheckCircle, XCircle, AlertCircle, Plus, 
  HelpCircle, CheckCircle2, ChevronRight 
} from 'lucide-react';

const MaterialRequirements = () => {
  const { 
    materialRequirements, updateMaterialRequirementStatus, addMaterialRequirement,
    laboratories, items 
  } = useContext(InventoryContext);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRequest, setNewRequest] = useState({
    labId: '', itemId: '', requestedQuantity: '', priority: 'Medium', requiredDate: ''
  });

  const handleCreateRequest = (e) => {
    e.preventDefault();
    addMaterialRequirement({
      ...newRequest,
      labId: Number(newRequest.labId),
      itemId: Number(newRequest.itemId),
      requestedQuantity: Number(newRequest.requestedQuantity)
    });
    setIsModalOpen(false);
    setNewRequest({ labId: '', itemId: '', requestedQuantity: '', priority: 'Medium', requiredDate: '' });
    alert('Laboratory material request added.');
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-50 text-red-700 border-red-100';
      case 'Medium': return 'bg-amber-50 text-amber-700 border-amber-100';
      default: return 'bg-blue-50 text-blue-700 border-blue-100';
    }
  };

  const handleAction = (id, action) => {
    updateMaterialRequirementStatus(id, action);
    alert(`Requirement request marked as ${action}.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-textPrimary tracking-tight">Material Requirements</h1>
          <p className="text-textSecondary text-sm mt-1">Track and fulfill material requests submitted by laboratories.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} size="sm">
          <Plus size={16} className="mr-2" /> Request Materials
        </Button>
      </div>

      {/* Main Board Card */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg text-textPrimary">Pending & Processed Requests</h3>
          <div className="text-xs text-textSecondary font-semibold">Active Lab Orders</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-textSecondary uppercase tracking-wider">
                <th className="py-3 px-4">Request ID</th>
                <th className="py-3 px-4">Laboratory</th>
                <th className="py-3 px-4">Required Item</th>
                <th className="py-3 px-4 text-center">Req. Qty</th>
                <th className="py-3 px-4 text-center">Available Qty</th>
                <th className="py-3 px-4 text-center">Shortage</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Required Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {materialRequirements.map((req) => {
                const lab = laboratories.find(l => l.id === req.labId);
                const item = items.find(i => i.id === req.itemId);
                
                // Calculate actual live shortage
                const available = item ? item.quantity : 0;
                const shortage = Math.max(0, req.requestedQuantity - available);

                return (
                  <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-500">REQ-{String(req.id).padStart(3, '0')}</td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-textPrimary">{lab?.name || 'Unknown Lab'}</div>
                      <div className="text-xs text-textSecondary">{lab?.department}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-textPrimary">{item?.name || 'Unknown Item'}</div>
                      <div className="text-xs text-textSecondary">{item?.code} | {item?.brand}</div>
                    </td>
                    <td className="py-4 px-4 text-center font-bold text-textPrimary">{req.requestedQuantity}</td>
                    <td className="py-4 px-4 text-center font-semibold text-textSecondary">{available}</td>
                    <td className="py-4 px-4 text-center">
                      {shortage > 0 ? (
                        <span className="font-bold text-rose-600 inline-flex items-center gap-1">
                          <AlertCircle size={14} /> {shortage}
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-semibold">0</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getPriorityBadge(req.priority)}`}>
                        {req.priority}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-textSecondary font-medium">
                      {new Date(req.requiredDate).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        req.status === 'Pending' ? 'bg-amber-50 text-amber-700' :
                        req.status === 'Approved' ? 'bg-blue-50 text-blue-700' :
                        req.status === 'Fulfilled' ? 'bg-emerald-50 text-emerald-700' :
                        'bg-red-50 text-red-700'
                      }`}>
                        {req.status === 'Pending' && <HelpCircle size={12} />}
                        {req.status === 'Fulfilled' && <CheckCircle2 size={12} />}
                        {req.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      {req.status === 'Pending' && (
                        <div className="flex justify-end gap-1.5">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-emerald-700 hover:bg-emerald-50 border-emerald-200 h-8"
                            onClick={() => handleAction(req.id, 'Fulfilled')}
                            disabled={shortage > 0}
                            title={shortage > 0 ? "Cannot fulfill due to shortage" : "Fulfill Request"}
                          >
                            Fulfill
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-rose-700 hover:bg-rose-50 border-rose-200 h-8"
                            onClick={() => handleAction(req.id, 'Rejected')}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                      {req.status === 'Fulfilled' && (
                        <span className="text-xs text-textSecondary italic font-medium inline-flex items-center">
                          Completed <CheckCircle size={14} className="text-emerald-600 ml-1.5" />
                        </span>
                      )}
                      {req.status === 'Rejected' && (
                        <span className="text-xs text-rose-500 font-semibold inline-flex items-center">
                          Rejected <XCircle size={14} className="text-rose-500 ml-1.5" />
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {materialRequirements.length === 0 && (
                <tr>
                  <td colSpan="10" className="py-8 text-center text-textSecondary">
                    No material requirements recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-white p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h3 className="font-bold text-lg text-textPrimary">Create Material Request</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-textSecondary hover:text-textPrimary text-xl font-bold">×</button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-textPrimary">Requesting Laboratory *</label>
                <Select
                  value={newRequest.labId}
                  onChange={(e) => setNewRequest({ ...newRequest, labId: e.target.value })}
                  required
                >
                  <option value="">Select Laboratory</option>
                  {laboratories.map(l => (
                    <option key={l.id} value={l.id}>{l.name} ({l.department})</option>
                  ))}
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-textPrimary">Requested Item *</label>
                <Select
                  value={newRequest.itemId}
                  onChange={(e) => setNewRequest({ ...newRequest, itemId: e.target.value })}
                  required
                >
                  <option value="">Select Item</option>
                  {items.map(i => (
                    <option key={i.id} value={i.id}>{i.name} ({i.code}) - Stock: {i.quantity}</option>
                  ))}
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-textPrimary">Quantity *</label>
                  <Input
                    type="number"
                    value={newRequest.requestedQuantity}
                    onChange={(e) => setNewRequest({ ...newRequest, requestedQuantity: e.target.value })}
                    placeholder="e.g. 5"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-textPrimary">Priority *</label>
                  <Select
                    value={newRequest.priority}
                    onChange={(e) => setNewRequest({ ...newRequest, priority: e.target.value })}
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-textPrimary">Required Date *</label>
                <Input
                  type="date"
                  value={newRequest.requiredDate}
                  onChange={(e) => setNewRequest({ ...newRequest, requiredDate: e.target.value })}
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit">Submit Request</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MaterialRequirements;
