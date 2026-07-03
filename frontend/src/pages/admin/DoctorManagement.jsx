import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Search, Filter, MoreVertical, Edit2, Trash2, Eye, EyeOff, Star } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { Card } from '../../components/ui/Card';

const DoctorManagement = () => {
  const [doctorsList, setDoctorsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const defaultFormData = {
    name: '',
    email: '',
    phone: '',
    employeeId: '',
    specialization: 'Orthodontics',
    qualification: '',
    experience: '',
    consultationFee: '',
    password: '',
    confirmPassword: ''
  };

  const [formData, setFormData] = useState(defaultFormData);

  const fetchDoctors = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/admin/doctors', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDoctorsList(res.data);
    } catch (err) {
      console.error(err);
      setError('Unable to load doctors');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
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

  const handleEditDoctor = (doc) => {
    setEditingId(doc._id);
    setFormData({
      name: doc.name,
      email: doc.email,
      phone: doc.phone || '',
      employeeId: doc.employeeId || '',
      specialization: doc.specialization || 'Orthodontics',
      qualification: doc.qualification || '',
      experience: doc.experience || '',
      consultationFee: doc.consultationFee || '',
      password: '',
      confirmPassword: ''
    });
    setIsModalOpen(true);
  };

  const handleSaveDoctor = async (e) => {
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
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        employeeId: formData.employeeId,
        specialization: formData.specialization,
        qualification: formData.qualification,
        experience: formData.experience,
        consultationFee: formData.consultationFee,
        status: 'Active',
      };
      
      if (formData.password) {
        payload.password = formData.password;
      }

      if (editingId) {
        await axios.put(`http://localhost:5000/api/admin/doctors/${editingId}`, payload, config);
      } else {
        await axios.post('http://localhost:5000/api/admin/doctors', payload, config);
      }
      
      closeModal();
      fetchDoctors();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error saving doctor profile');
    }
  };

  const handleDeleteDoctor = async (id) => {
    if (!window.confirm('Are you sure you want to delete this doctor?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/admin/doctors/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDoctors();
    } catch (err) {
      console.error(err);
      alert('Error deleting doctor');
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Doctor Management</h1>
          <p className="text-slate-500 text-sm mt-1">Manage doctor profiles, specialties, and schedules.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="shrink-0">
          <Plus size={18} className="mr-2" />
          Add Doctor
        </Button>
      </div>

      <Card>
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50 rounded-t-xl">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input placeholder="Search doctors..." className="pl-10 bg-white" />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Select 
              className="w-[160px]" 
              options={[{label: 'All Specialties', value: 'all'}, {label: 'Orthodontics', value: 'Orthodontics'}, {label: 'Pediatrics', value: 'Pediatrics'}, {label: 'Oral Surgery', value: 'Oral Surgery'}]} 
            />
          </div>
        </div>
        
        <div className="p-6 bg-slate-50/30">
          {isLoading ? (
            <div className="p-8 text-center text-slate-500">Loading doctors...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">{error}</div>
          ) : doctorsList.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No doctors found.
              <br />
              Click "Add Doctor" to create your first doctor profile.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {doctorsList.map((doc) => (
                <div key={doc._id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative">
                  <div className="absolute top-4 right-4 flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEditDoctor(doc)} className="text-slate-400 hover:text-blue-600 h-8 w-8">
                      <Edit2 size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteDoctor(doc._id)} className="text-slate-400 hover:text-red-600 hover:bg-red-50 h-8 w-8">
                      <Trash2 size={14} />
                    </Button>
                  </div>
                  <div className="flex justify-between items-start mb-4 pr-16">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
                        {doc.name.replace('Dr. ', '').charAt(0) || 'D'}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{doc.name}</h3>
                        <p className="text-xs text-blue-600 font-medium">{doc.specialization || 'General'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-5">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Employee ID</span>
                      <span className="font-semibold text-slate-900">{doc.employeeId || '-'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Experience</span>
                      <span className="font-semibold text-slate-900">{doc.experience ? `${doc.experience} Years` : '-'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Consultation Fee</span>
                      <span className="font-semibold text-slate-900">{doc.consultationFee ? `$${doc.consultationFee}` : '-'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Status</span>
                      <Badge variant={doc.isActive ? 'success' : 'warning'}>{doc.isActive ? 'Active' : 'Inactive'}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingId ? "Edit Doctor" : "Add New Doctor"} maxWidth="max-w-2xl">
        <form className="space-y-6" onSubmit={handleSaveDoctor}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Full Name</label>
              <Input 
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Dr. John Doe" 
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
                placeholder="doctor@clinic.com" 
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Phone</label>
              <Input 
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 234 567 8900" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Specialization</label>
              <Select 
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                options={[{label: 'Orthodontics', value: 'Orthodontics'}, {label: 'Pediatrics', value: 'Pediatrics'}, {label: 'Oral Surgery', value: 'Oral Surgery'}, {label: 'General Dentistry', value: 'General Dentistry'}]} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Qualification</label>
              <Input 
                name="qualification"
                value={formData.qualification}
                onChange={handleChange}
                placeholder="BDS, MDS" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Experience (Years)</label>
              <Input 
                type="number"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                placeholder="5" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Consultation Fee ($)</label>
              <Input 
                type="number"
                name="consultationFee"
                value={formData.consultationFee}
                onChange={handleChange}
                placeholder="150" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                {editingId ? "New Password (Optional)" : "Password"}
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
            <Button type="submit">Save Doctor Profile</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DoctorManagement;
