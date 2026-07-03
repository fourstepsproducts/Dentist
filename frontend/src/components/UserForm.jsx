import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { X } from 'lucide-react';

const UserForm = ({ initialData, role, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    isActive: true,
    role: role,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        email: initialData.email || '',
        password: '', // Never populate password on edit
        isActive: initialData.isActive ?? true,
        role: initialData.role || role,
      });
    }
  }, [initialData, role]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-semibold text-textPrimary">
            {initialData ? 'Edit User' : `Create ${role.charAt(0).toUpperCase() + role.slice(1)} User`}
          </h2>
          <button onClick={onClose} className="text-textSecondary hover:text-textPrimary transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-textPrimary">Full Name</label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-textPrimary">Email Address</label>
            <Input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@clinic.com"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-textPrimary">
              Password {initialData && <span className="text-textSecondary font-normal text-xs">(Leave blank to keep current)</span>}
            </label>
            <Input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required={!initialData}
            />
          </div>

          {initialData && (
            <div className="flex items-center pt-2">
              <input
                id="isActive"
                name="isActive"
                type="checkbox"
                checked={formData.isActive}
                onChange={handleChange}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm font-medium text-textPrimary cursor-pointer">
                User is Active
              </label>
            </div>
          )}

          <div className="pt-4 flex justify-end space-x-3">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit">
              {initialData ? 'Save Changes' : 'Create User'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;
