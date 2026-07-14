import React, { useState, useEffect } from 'react';
import api from '../../api';
import { Plus, Search, Phone, MapPin, Activity, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Card } from '../../components/ui/Card';
import { SearchableMultiSelect } from '../../components/ui/SearchableMultiSelect';

const LabManagement = () => {
  const [labs, setLabs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Specialization state
  const [specializations, setSpecializations] = useState([]);
  const [isNewSpecModalOpen, setIsNewSpecModalOpen] = useState(false);
  const [newSpecName, setNewSpecName] = useState('');
  const [isSavingSpec, setIsSavingSpec] = useState(false);
  
  const defaultFormData = {
    name: '',
    phone: '',
    address: '',
    specialization: [] // Now an array of selected specialization names
  };

  const [formData, setFormData] = useState(defaultFormData);

  // Fetch specializations from the backend
  const fetchSpecializations = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await api.get('/specializations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSpecializations(res.data);
    } catch (err) {
      console.error('Failed to fetch specializations', err);
    }
  };

  useEffect(() => {
    fetchSpecializations();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.address || formData.specialization.length === 0) {
      alert("Please fill in all fields and select at least one specialization.");
      return;
    }

    const newLab = {
      id: `LAB0${labs.length + 1}`,
      name: formData.name,
      phone: formData.phone,
      address: formData.address,
      specialization: formData.specialization.join(', '),
      status: 'Active'
    };

    setLabs([...labs, newLab]);
    setFormData(defaultFormData);
    setIsModalOpen(false);
  };

  const handleDeleteLab = (id) => {
    if (window.confirm('Are you sure you want to remove this laboratory partner?')) {
      setLabs(labs.filter(lab => lab.id !== id));
    }
  };

  const handleCreateSpecialization = async (e) => {
    e.preventDefault();
    if (!newSpecName.trim()) return;
    try {
      setIsSavingSpec(true);
      const token = localStorage.getItem('token');
      const res = await api.post('/specializations', { name: newSpecName.trim() }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Refresh the list
      await fetchSpecializations();
      // Auto-select the newly created specialization
      setFormData(prev => ({
        ...prev,
        specialization: [...prev.specialization, res.data.name]
      }));
      // Close sub-modal
      setIsNewSpecModalOpen(false);
      setNewSpecName('');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error creating specialization');
    } finally {
      setIsSavingSpec(false);
    }
  };

  const filteredLabs = labs.filter(lab => 
    lab.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lab.phone.includes(searchQuery) ||
    lab.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lab.specialization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const specializationOptions = specializations.map(s => ({
    label: s.name,
    value: s.name,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Laboratory Management</h1>
          <p className="text-slate-500 text-sm mt-1">Manage external partner labs and their details.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="shrink-0">
          <Plus size={18} className="mr-2" />
          Add Laboratory Partner
        </Button>
      </div>

      <Card>
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-t-xl">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input 
              placeholder="Search labs by name, specialization, or phone..." 
              className="pl-10 bg-white" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-medium">Laboratory Name</th>
                <th className="px-6 py-4 font-medium">Specialization / Use</th>
                <th className="px-6 py-4 font-medium">Physical Address</th>
                <th className="px-6 py-4 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLabs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-slate-500">
                    No laboratory partners found.
                  </td>
                </tr>
              ) : (
                filteredLabs.map((lab) => (
                  <tr key={lab.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{lab.name}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <Phone size={12} className="text-slate-400" /> {lab.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-700 max-w-xs break-words font-medium">
                        {lab.specialization}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-slate-500 flex items-start gap-1 mt-0.5 max-w-sm">
                        <MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" />
                        <span className="break-words">{lab.address}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Badge variant={lab.status === 'Active' ? 'success' : 'danger'}>{lab.status}</Badge>
                        <button 
                          onClick={() => handleDeleteLab(lab.id)}
                          className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                          title="Remove Partner"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Laboratory Partner Modal */}
      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setFormData(defaultFormData); }} title="Add Laboratory Partner" maxWidth="max-w-md">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Lab Name</label>
            <Input 
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter lab name" 
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Phone Number</label>
            <Input 
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 234 567 8900" 
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">What is the use of this lab / Specialization</label>
            <SearchableMultiSelect
              options={specializationOptions}
              value={formData.specialization}
              onChange={(val) => setFormData(prev => ({ ...prev, specialization: val }))}
              placeholder="Select specializations..."
              searchPlaceholder="Search specializations..."
              createNewLabel="Create New Specialization"
              onCreateNew={() => setIsNewSpecModalOpen(true)}
            />
            {formData.specialization.length === 0 && <input type="text" required className="hidden" />}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Physical Address</label>
            <textarea 
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full min-h-[80px] p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm text-sm" 
              placeholder="Enter full lab address..." 
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="ghost" type="button" onClick={() => { setIsModalOpen(false); setFormData(defaultFormData); }}>Cancel</Button>
            <Button type="submit">Add Laboratory</Button>
          </div>
        </form>
      </Modal>

      {/* Create New Specialization Sub-Modal */}
      <Modal
        isOpen={isNewSpecModalOpen}
        onClose={() => {
          setIsNewSpecModalOpen(false);
          setNewSpecName('');
        }}
        title="Create New Specialization"
        maxWidth="max-w-sm"
      >
        <form className="space-y-4" onSubmit={handleCreateSpecialization}>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">Specialization Name</label>
            <Input
              name="specName"
              value={newSpecName}
              onChange={(e) => setNewSpecName(e.target.value)}
              placeholder="e.g. Ceramic Crowns"
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              variant="ghost"
              type="button"
              onClick={() => {
                setIsNewSpecModalOpen(false);
                setNewSpecName('');
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSavingSpec}>
              {isSavingSpec ? 'Saving...' : 'Save Specialization'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default LabManagement;
