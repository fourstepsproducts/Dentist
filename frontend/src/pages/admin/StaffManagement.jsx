import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Search, Filter, MoreVertical, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { Card } from '../../components/ui/Card';

const StaffManagement = () => {
  const [staffList, setStaffList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const defaultFormData = {
    name: '',
    email: '',
    role: 'Receptionist',
    password: '',
    confirmPassword: ''
  };

  const [formData, setFormData] = useState(defaultFormData);

  const fetchStaff = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/admin/staff', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStaffList(res.data);
    } catch (err) {
      console.error(err);
      setError('Unable to load staff');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(defaultFormData);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleEditStaff = (staff) => {
    setEditingId(staff._id);
    setFormData({
      name: staff.name,
      email: staff.email,
      role: staff.role.toLowerCase(),
      password: '',
      confirmPassword: ''
    });
    setIsModalOpen(true);
  };

  const handleSaveStaff = async (e) => {
    e.preventDefault();
    if (formData.password || formData.confirmPassword || !editingId) {
      if (formData.password !== formData.confirmPassword) {
        alert("Passwords do not match!");
        return;
      }
    }

    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const payload = {
        name: formData.name || 'New Employee',
        email: formData.email,
        role: formData.role,
        department: 'Administration',
        status: 'Active',
      };
      
      if (formData.password) {
        payload.password = formData.password;
      }

      if (editingId) {
        await axios.put(`http://localhost:5000/api/admin/staff/${editingId}`, payload, config);
      } else {
        await axios.post('http://localhost:5000/api/admin/staff', payload, config);
      }
      
      closeModal();
      fetchStaff();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error saving staff member');
    }
  };

  const handleDeleteStaff = async (id) => {
    if (!window.confirm('Are you sure you want to delete this staff member?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/admin/staff/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchStaff();
    } catch (err) {
      console.error(err);
      alert('Error deleting staff member');
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Staff Management</h1>
          <p className="text-slate-500 text-sm mt-1">Manage all clinic employees, roles, and access.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="shrink-0">
          <Plus size={18} className="mr-2" />
          Add New Staff
        </Button>
      </div>

      <Card>
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50 rounded-t-xl">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input placeholder="Search staff..." className="pl-10 bg-white" />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Select 
              className="w-[140px]" 
              options={[{label: 'All Roles', value: 'all'}, {label: 'Nurse', value: 'nurse'}, {label: 'Receptionist', value: 'receptionist'}]} 
            />
            <Select 
              className="w-[140px]" 
              options={[{label: 'All Status', value: 'all'}, {label: 'Active', value: 'active'}, {label: 'Inactive', value: 'inactive'}]} 
            />
            <Button variant="outline" size="icon" className="shrink-0"><Filter size={18} /></Button>
          </div>
        </div>
        
        <div className="p-6 bg-slate-50/30">
          {isLoading ? (
            <div className="p-8 text-center text-slate-500">Loading staff...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">{error}</div>
          ) : staffList.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No staff members found.
              <br />
              Click "Add New Staff" to create your first employee.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {staffList.map((staff) => (
                <div key={staff._id || staff.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative">
                  <div className="absolute top-4 right-4 flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEditStaff(staff)} className="text-slate-400 hover:text-blue-600 h-8 w-8">
                      <Edit2 size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteStaff(staff._id || staff.id)} className="text-slate-400 hover:text-red-600 hover:bg-red-50 h-8 w-8">
                      <Trash2 size={14} />
                    </Button>
                  </div>
                  <div className="flex justify-between items-start mb-4 pr-16">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
                        {staff.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{staff.name}</h3>
                        <p className="text-xs text-blue-600 font-medium">{staff.role}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-5">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Employee ID</span>
                      <span className="font-semibold text-slate-900">{staff.employeeId || '-'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Email</span>
                      <span className="font-semibold text-slate-900 truncate ml-4" title={staff.email}>{staff.email}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Department</span>
                      <span className="font-semibold text-slate-900">{staff.department || 'Administration'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Status</span>
                      <Badge variant={(staff.status || (staff.isActive ? 'Active' : 'Inactive')) === 'Active' ? 'success' : 'warning'}>
                        {staff.status || (staff.isActive ? 'Active' : 'Inactive')}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingId ? "Edit Staff" : "Add New Staff"} maxWidth="max-w-md">
        <form className="space-y-6" onSubmit={handleSaveStaff}>
          <div className="flex flex-col space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Full Name</label>
              <Input 
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter full name" 
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Email Address</label>
              <Input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@clinic.com" 
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Role</label>
              <Select 
                name="role"
                value={formData.role}
                onChange={handleChange}
                options={[
                  {label: 'Receptionist', value: 'Receptionist'}, 
                  {label: 'Nurse', value: 'Nurse'},
                  {label: 'Lab Staff', value: 'Lab Staff'},
                  {label: 'Accountant', value: 'Accountant'},
                  {label: 'Pharmacist', value: 'Pharmacist'},
                  {label: 'Admin Staff', value: 'Admin Staff'},
                  {label: 'Cleaner', value: 'Cleaner'},
                  {label: 'Security', value: 'Security'}
                ]} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                {editingId ? "New Temporary Password (Optional)" : "Temporary Password"}
              </label>
              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"} 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••" 
                  className="pr-10" 
                  required={!editingId}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Confirm Password</label>
              <div className="relative">
                <Input 
                  type={showConfirmPassword ? "text" : "password"} 
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••" 
                  className="pr-10" 
                  required={!editingId}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="ghost" onClick={(e) => { e.preventDefault(); closeModal(); }}>Cancel</Button>
            <Button type="submit">Save Staff Member</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StaffManagement;
