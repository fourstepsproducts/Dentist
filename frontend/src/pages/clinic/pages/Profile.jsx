import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../../context/AuthContext';
import { Card } from '../../../components/ui/Card';
import { 
  User, Mail, Phone, MapPin, Building, Calendar, 
  Clock, Activity, Shield, AlertTriangle, Eye, EyeOff, CheckCircle2 
} from 'lucide-react';
import { cn } from '../../../lib/utils';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    phone: '',
    alternateMobile: '',
    address: '',
    city: '',
    state: '',
    country: '',
    pincode: '',
    emergencyContact: {
      contactPerson: '',
      relationship: '',
      phoneNumber: ''
    }
  });

  // Password state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [mustChangePassword, setMustChangePassword] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get('/api/staff/profile', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setProfile(data);
      setMustChangePassword(data.mustChangePassword);
      setEditForm({
        phone: data.phone || '',
        alternateMobile: data.alternateMobile || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        country: data.country || '',
        pincode: data.pincode || '',
        emergencyContact: {
          contactPerson: data.emergencyContact?.contactPerson || '',
          relationship: data.emergencyContact?.relationship || '',
          phoneNumber: data.emergencyContact?.phoneNumber || ''
        }
      });
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch profile');
      setLoading(false);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('emergencyContact.')) {
      const field = name.split('.')[1];
      setEditForm(prev => ({
        ...prev,
        emergencyContact: { ...prev.emergencyContact, [field]: value }
      }));
    } else {
      setEditForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.put('/api/staff/profile', editForm, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setProfile(data);
      setIsEditing(false);
      // Could add toast here
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return setPasswordError('New passwords do not match');
    }

    // Basic regex for strong password (8 char, upper, lower, num, special)
    const strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
    if (!strongRegex.test(passwordForm.newPassword)) {
      return setPasswordError('Password must be at least 8 characters and include uppercase, lowercase, number, and special character');
    }

    setIsChangingPassword(true);
    try {
      await axios.put('/api/staff/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setPasswordSuccess('Password updated successfully!');
      setMustChangePassword(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      // Fetch profile to update dates/flags
      fetchProfile();
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-slate-200 rounded-xl"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-200 rounded-xl"></div>
          <div className="h-64 bg-slate-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return <div className="text-red-500 text-center p-8">{error}</div>;
  }

  // Calculate completion percentage loosely
  let filledFields = 0;
  let totalFields = 15;
  if(profile.phone) filledFields++;
  if(profile.alternateMobile) filledFields++;
  if(profile.address) filledFields++;
  if(profile.city) filledFields++;
  if(profile.state) filledFields++;
  if(profile.country) filledFields++;
  if(profile.pincode) filledFields++;
  if(profile.emergencyContact?.contactPerson) filledFields++;
  if(profile.gender) filledFields++;
  if(profile.bloodGroup) filledFields++;
  // Base fields
  filledFields += 5; // name, email, role, etc.
  const completionPercent = Math.round((filledFields / totalFields) * 100);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Staff Profile</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your personal and professional information</p>
      </div>

      {/* Header Card */}
      <Card className="overflow-hidden relative">
        <div className="h-24 bg-gradient-to-r from-blue-600 to-teal-500"></div>
        <div className="px-8 pb-8 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-12 sm:-mt-10 gap-6">
            <div className="w-24 h-24 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center text-3xl font-bold text-blue-600 shadow-md">
              {profile.name?.charAt(0)}
            </div>
            <div className="flex-1 text-center sm:text-left mb-2">
              <h2 className="text-2xl font-bold text-slate-900">{profile.name}</h2>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-2 text-sm text-slate-500 font-medium">
                <span className="flex items-center gap-1.5"><Building size={16} /> {profile.department}</span>
                <span className="flex items-center gap-1.5"><Activity size={16} /> Role: {profile.role}</span>
                <span className="flex items-center gap-1.5"><User size={16} /> Emp Code: {profile.employeeId || 'N/A'}</span>
              </div>
            </div>
            <div className="flex flex-col items-center sm:items-end gap-2 mb-2">
              <span className={cn(
                "px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wide",
                profile.status === 'Active' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              )}>
                {profile.status}
              </span>
              <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                {completionPercent}% Complete
              </span>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column */}
        <div className="space-y-6">
          {/* Security Section (Prioritized) */}
          <Card className="p-6 border-slate-200">
            <div className="flex items-center gap-2 mb-6">
              <Shield className="text-slate-700" size={20} />
              <h3 className="text-lg font-bold text-slate-900">Security & Account</h3>
            </div>

            {mustChangePassword && (
              <div className="mb-6 bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3">
                <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={20} />
                <div>
                  <h4 className="font-semibold text-amber-800">Temporary Password Warning</h4>
                  <p className="text-sm text-amber-700 mt-1">You are currently using the temporary password created by the administrator. For security reasons, you must change your password before continuing.</p>
                </div>
              </div>
            )}

            {!mustChangePassword && (
              <div className="mb-6 bg-emerald-50 border border-emerald-100 p-3 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="text-emerald-500 shrink-0" size={18} />
                <span className="text-sm font-medium text-emerald-800">Account Secured</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {passwordError && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 font-medium">{passwordError}</div>}
              {passwordSuccess && <div className="text-sm text-emerald-600 bg-emerald-50 p-3 rounded-lg border border-emerald-100 font-medium">{passwordSuccess}</div>}
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Current Password</label>
                <div className="relative">
                  <input 
                    type={showPassword.current ? "text" : "password"} 
                    required 
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  />
                  <button type="button" onClick={() => setShowPassword(p => ({...p, current: !p.current}))} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600">
                    {showPassword.current ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">New Password</label>
                  <div className="relative">
                    <input 
                      type={showPassword.new ? "text" : "password"} 
                      required 
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                    />
                    <button type="button" onClick={() => setShowPassword(p => ({...p, new: !p.new}))} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600">
                      {showPassword.new ? <EyeOff size={16}/> : <Eye size={16}/>}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <input 
                      type={showPassword.confirm ? "text" : "password"} 
                      required 
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                    />
                    <button type="button" onClick={() => setShowPassword(p => ({...p, confirm: !p.confirm}))} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600">
                      {showPassword.confirm ? <EyeOff size={16}/> : <Eye size={16}/>}
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="pt-2">
                <button type="submit" disabled={isChangingPassword} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-800 disabled:opacity-70 transition-colors">
                  {isChangingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-500 block mb-1">Last Login</span>
                <span className="font-semibold text-slate-800">{profile.lastLogin ? new Date(profile.lastLogin).toLocaleString() : 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-1">Password Last Changed</span>
                <span className="font-semibold text-slate-800">{profile.passwordChangedAt ? new Date(profile.passwordChangedAt).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
          </Card>

          {/* Personal Information */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-900">Personal Information</h3>
              {!isEditing && (
                <button onClick={() => setIsEditing(true)} className="text-blue-600 text-sm font-bold hover:text-blue-700">Edit Profile</button>
              )}
            </div>

            {isEditing ? (
              <form id="profile-form" onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Mobile Number</label>
                    <input type="text" name="phone" value={editForm.phone} onChange={handleEditChange} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Alternate Mobile</label>
                    <input type="text" name="alternateMobile" value={editForm.alternateMobile} onChange={handleEditChange} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                  <input type="text" name="address" value={editForm.address} onChange={handleEditChange} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                    <input type="text" name="city" value={editForm.city} onChange={handleEditChange} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                    <input type="text" name="state" value={editForm.state} onChange={handleEditChange} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
                    <input type="text" name="country" value={editForm.country} onChange={handleEditChange} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Pincode</label>
                    <input type="text" name="pincode" value={editForm.pincode} onChange={handleEditChange} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">Save Changes</button>
                  <button type="button" onClick={() => setIsEditing(false)} className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-200">Cancel</button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500 block">Email Address</span>
                    <span className="font-medium text-slate-900">{profile.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Mobile Number</span>
                    <span className="font-medium text-slate-900">{profile.phone || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Alternate Mobile</span>
                    <span className="font-medium text-slate-900">{profile.alternateMobile || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Gender</span>
                    <span className="font-medium text-slate-900">{profile.gender || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Date of Birth</span>
                    <span className="font-medium text-slate-900">{profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Blood Group</span>
                    <span className="font-medium text-slate-900">{profile.bloodGroup || 'N/A'}</span>
                  </div>
                </div>
                
                <div className="border-t border-slate-100 pt-4 mt-4">
                  <span className="text-slate-500 block text-sm mb-1">Address</span>
                  <span className="font-medium text-slate-900 text-sm">
                    {profile.address ? (
                      <>{profile.address}, {profile.city}, {profile.state}, {profile.country} - {profile.pincode}</>
                    ) : 'N/A'}
                  </span>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          
          {/* Professional Information */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Professional Information</h3>
            <div className="grid grid-cols-2 gap-y-4 gap-x-4 text-sm">
              <div>
                <span className="text-slate-500 block mb-1">Role</span>
                <span className="font-medium text-slate-900">{profile.role}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-1">Department</span>
                <span className="font-medium text-slate-900">{profile.department}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-1">Employee ID</span>
                <span className="font-medium text-slate-900">{profile.employeeId || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-1">Qualification</span>
                <span className="font-medium text-slate-900">{profile.qualification || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-1">Experience</span>
                <span className="font-medium text-slate-900">{profile.experience ? `${profile.experience} years` : 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-1">Joining Date</span>
                <span className="font-medium text-slate-900">{new Date(profile.createdAt).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-1">License Number</span>
                <span className="font-medium text-slate-900">{profile.licenseNumber || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-1">Employment Type</span>
                <span className="font-medium text-slate-900">{profile.employmentType || 'Full Time'}</span>
              </div>
              {profile.monthlySalary !== undefined && (
                <div>
                  <span className="text-slate-500 block mb-1">Monthly Salary</span>
                  <span className="font-semibold text-emerald-600">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(profile.monthlySalary)}
                  </span>
                </div>
              )}
            </div>
          </Card>

          {/* Emergency Contact */}
          <Card className="p-6 bg-red-50/30 border-red-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Emergency Contact</h3>
            {isEditing ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Contact Person</label>
                  <input type="text" name="emergencyContact.contactPerson" value={editForm.emergencyContact.contactPerson} onChange={handleEditChange} form="profile-form" className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Relationship</label>
                    <input type="text" name="emergencyContact.relationship" value={editForm.emergencyContact.relationship} onChange={handleEditChange} form="profile-form" className="w-full px-3 py-2 border rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                    <input type="text" name="emergencyContact.phoneNumber" value={editForm.emergencyContact.phoneNumber} onChange={handleEditChange} form="profile-form" className="w-full px-3 py-2 border rounded-lg text-sm" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500 block mb-1">Contact Person</span>
                  <span className="font-medium text-slate-900">{profile.emergencyContact?.contactPerson || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Relationship</span>
                  <span className="font-medium text-slate-900">{profile.emergencyContact?.relationship || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Phone Number</span>
                  <span className="font-medium text-slate-900">{profile.emergencyContact?.phoneNumber || 'N/A'}</span>
                </div>
              </div>
            )}
          </Card>
          
        </div>
      </div>
    </div>
  );
};

export default Profile;
