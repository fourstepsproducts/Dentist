import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Search, Eye, Edit2, Trash2, Calendar, Phone, Mail, MapPin, User, Activity, ShieldAlert } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card } from '../../../components/ui/Card';
import { Modal } from '../../../components/ui/Modal';
import { Badge } from '../../../components/ui/Badge';

const PatientRecords = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [editingPatient, setEditingPatient] = useState(null);

  // Form State
  const defaultFormData = {
    name: '',
    phone: '',
    email: '',
    gender: 'Male',
    dateOfBirth: '',
    address: '',
    emergencyContact: {
      name: '',
      relationship: '',
      phone: '',
    },
  };
  const [formData, setFormData] = useState(defaultFormData);
  const [isSaving, setIsSaving] = useState(false);

  const fetchPatients = async (search = '') => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/patients?search=${search}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPatients(res.data);
    } catch (err) {
      console.error('Error fetching patients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    fetchPatients(query);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('emergency_')) {
      const field = name.replace('emergency_', '');
      setFormData((prev) => ({
        ...prev,
        emergencyContact: {
          ...prev.emergencyContact,
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleOpenRegister = () => {
    setEditingPatient(null);
    setFormData(defaultFormData);
    setIsRegModalOpen(true);
  };

  const handleOpenEdit = (patient) => {
    setEditingPatient(patient);
    setFormData({
      name: patient.name,
      phone: patient.phone,
      email: patient.email || '',
      gender: patient.gender,
      dateOfBirth: patient.dateOfBirth ? patient.dateOfBirth.substring(0, 10) : '',
      address: patient.address,
      emergencyContact: {
        name: patient.emergencyContact?.name || '',
        relationship: patient.emergencyContact?.relationship || '',
        phone: patient.emergencyContact?.phone || '',
      },
    });
    setIsRegModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.dateOfBirth || !formData.gender || !formData.address) {
      alert('Please fill in all required fields.');
      return;
    }

    try {
      setIsSaving(true);
      const token = localStorage.getItem('token');
      if (editingPatient) {
        // Edit existing
        await axios.put(`/api/patients/${editingPatient._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        // Create new
        await axios.post('/api/patients', formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setIsRegModalOpen(false);
      setFormData(defaultFormData);
      fetchPatients(searchQuery);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error saving patient');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this patient record? This will permanently delete all clinical logs associated with them.')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/patients/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchPatients(searchQuery);
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.message || 'Error deleting patient');
      }
    }
  };

  const handleOpenDetails = async (patient) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/patients/${patient._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedPatient(res.data);
      setIsDetailsModalOpen(true);
    } catch (err) {
      console.error(err);
      alert('Error fetching patient history details');
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return '-';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Patient Records</h1>
          <p className="text-slate-500 text-sm mt-1">Manage and register dental clinic patient files.</p>
        </div>
        <Button onClick={handleOpenRegister} className="shrink-0">
          <Plus size={18} className="mr-2" />
          Register Patient
        </Button>
      </div>

      <Card>
        {/* Search Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-t-xl">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input
              placeholder="Search by Patient ID, Name, or Phone..."
              className="pl-10 bg-white"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        {/* Patients Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-medium">Patient ID</th>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Age / DOB</th>
                <th className="px-6 py-4 font-medium">Gender</th>
                <th className="px-6 py-4 font-medium">Phone Number</th>
                <th className="px-6 py-4 font-medium">Reg. Date</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-slate-400 animate-pulse">
                    Loading patient records...
                  </td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-slate-500">
                    No patient records found.
                  </td>
                </tr>
              ) : (
                patients.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-700">{p.patientId}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900">{p.name}</td>
                    <td className="px-6 py-4 text-slate-600">
                      {calculateAge(p.dateOfBirth)} yrs <span className="text-xs text-slate-400 block">{formatDate(p.dateOfBirth)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={p.gender === 'Male' ? 'primary' : p.gender === 'Female' ? 'success' : 'warning'}>
                        {p.gender}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{p.phone}</td>
                    <td className="px-6 py-4 text-slate-500">{formatDate(p.createdAt)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenDetails(p)}
                          className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg transition-colors"
                          title="View History"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="text-slate-400 hover:text-amber-600 hover:bg-amber-50 p-1.5 rounded-lg transition-colors"
                          title="Edit Details"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(p._id)}
                          className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                          title="Delete Patient"
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

      {/* Registration/Edit Modal */}
      <Modal
        isOpen={isRegModalOpen}
        onClose={() => setIsRegModalOpen(false)}
        title={editingPatient ? 'Edit Patient Details' : 'Register New Patient'}
        maxWidth="max-w-lg"
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">Full Name *</label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                placeholder="Enter patient's full name"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">Phone Number *</label>
              <Input
                name="phone"
                value={formData.phone}
                onChange={handleFormChange}
                placeholder="Enter active phone number"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">Date of Birth *</label>
              <Input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">Gender *</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleFormChange}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm text-sm bg-white"
                required
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">Email Address (Optional)</label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleFormChange}
              placeholder="e.g. name@example.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">Full Residential Address *</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleFormChange}
              className="w-full min-h-[70px] p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm text-sm"
              placeholder="Enter active street, city, state address details"
              required
            />
          </div>

          {/* Emergency Contact */}
          <div className="border-t border-slate-100 pt-3 mt-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-3">Emergency Contact Info (Optional)</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-500 uppercase">Contact Name</label>
                <Input
                  name="emergency_name"
                  value={formData.emergencyContact.name}
                  onChange={handleFormChange}
                  placeholder="Contact Name"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-500 uppercase">Relationship</label>
                <Input
                  name="emergency_relationship"
                  value={formData.emergencyContact.relationship}
                  onChange={handleFormChange}
                  placeholder="e.g. Spouse"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-500 uppercase">Phone Number</label>
                <Input
                  name="emergency_phone"
                  value={formData.emergencyContact.phone}
                  onChange={handleFormChange}
                  placeholder="Phone"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              variant="ghost"
              type="button"
              onClick={() => setIsRegModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : editingPatient ? 'Update Record' : 'Register Patient'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Patient View Details / Clinic History Modal */}
      {selectedPatient && (
        <Modal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          title={`Clinical Record File: ${selectedPatient.name}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-1">
            {/* Demographics Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <User size={15} className="text-slate-400" />
                  <span className="font-semibold text-slate-700">Patient ID:</span> {selectedPatient.patientId}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Calendar size={15} className="text-slate-400" />
                  <span className="font-semibold text-slate-700">DOB:</span> {formatDate(selectedPatient.dateOfBirth)} ({calculateAge(selectedPatient.dateOfBirth)} yrs)
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Activity size={15} className="text-slate-400" />
                  <span className="font-semibold text-slate-700">Gender:</span> {selectedPatient.gender}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone size={15} className="text-slate-400" />
                  <span className="font-semibold text-slate-700">Phone:</span> {selectedPatient.phone}
                </div>
                {selectedPatient.email && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Mail size={15} className="text-slate-400" />
                    <span className="font-semibold text-slate-700">Email:</span> {selectedPatient.email}
                  </div>
                )}
                <div className="flex items-start gap-2 text-sm text-slate-600">
                  <MapPin size={15} className="text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-700">Address:</span> {selectedPatient.address}
                  </div>
                </div>
              </div>

              {selectedPatient.emergencyContact?.name && (
                <div className="col-span-1 md:col-span-2 border-t border-slate-200/60 pt-3 mt-1 text-xs text-slate-500">
                  <span className="font-bold text-slate-600">Emergency Contact:</span> {selectedPatient.emergencyContact.name} ({selectedPatient.emergencyContact.relationship}) - {selectedPatient.emergencyContact.phone}
                </div>
              )}
            </div>

            {/* History Tabs Content */}
            <div className="space-y-5">
              {/* 1. Chief Complaints */}
              <div>
                <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-1.5 mb-2.5">Chief Complaints</h4>
                {selectedPatient.chiefComplaints?.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No complaint logs registered.</p>
                ) : (
                  <ul className="space-y-2">
                    {selectedPatient.chiefComplaints.map((c, i) => (
                      <li key={i} className="text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex justify-between items-start">
                        <span className="text-slate-700 font-medium">{c.text}</span>
                        <span className="text-slate-400 shrink-0 text-[10px]">{formatDate(c.date)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* 2. Diagnoses */}
              <div>
                <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-1.5 mb-2.5">Diagnoses & Treatment Plans</h4>
                {selectedPatient.diagnoses?.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No diagnoses files logged.</p>
                ) : (
                  <div className="space-y-2.5">
                    {selectedPatient.diagnoses.map((d, i) => (
                      <div key={i} className="text-xs bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1">
                        <div className="flex justify-between items-center border-b border-slate-200/50 pb-1">
                          <span className="font-bold text-slate-800">Diagnosis: {d.diagnosis}</span>
                          <span className="text-slate-400 text-[10px]">{formatDate(d.date)}</span>
                        </div>
                        <p className="text-slate-600 font-medium pt-1"><span className="font-bold text-slate-700">Plan:</span> {d.treatmentPlan}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. Treatment Records */}
              <div>
                <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-1.5 mb-2.5">Treatment Records</h4>
                {selectedPatient.treatments?.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No treatments registered.</p>
                ) : (
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                        <th className="py-1.5">Treatment</th>
                        <th className="py-1.5 text-right">Cost</th>
                        <th className="py-1.5 text-right">Status</th>
                        <th className="py-1.5 text-right">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedPatient.treatments.map((t, i) => (
                        <tr key={i} className="text-slate-700 font-medium">
                          <td className="py-2">{t.name}</td>
                          <td className="py-2 text-right">${t.cost}</td>
                          <td className="py-2 text-right">
                            <span className={cn(
                              "px-1.5 py-0.5 rounded text-[10px] font-bold uppercase",
                              t.status === 'Completed' ? "bg-green-50 text-green-700 border border-green-200" : "bg-amber-50 text-amber-700 border border-amber-200"
                            )}>
                              {t.status}
                            </span>
                          </td>
                          <td className="py-2 text-right text-slate-400">{formatDate(t.date)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* 4. Documents */}
              <div>
                <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-1.5 mb-2.5">Documents & Files</h4>
                {selectedPatient.documents?.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No medical documents uploaded.</p>
                ) : (
                  <ul className="space-y-1.5">
                    {selectedPatient.documents.map((d, i) => (
                      <li key={i} className="text-xs bg-slate-50 p-2 rounded border border-slate-100 flex justify-between items-center">
                        <span className="font-semibold text-slate-700">{d.name} <span className="text-[10px] text-slate-400 ml-1">({d.type})</span></span>
                        <span className="text-slate-400 text-[10px]">{formatDate(d.uploadDate)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-4 border-t border-slate-100">
            <Button onClick={() => setIsDetailsModalOpen(false)}>Close Details</Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PatientRecords;
