import React, { useState, useEffect, useContext } from 'react';
import api from '../../api';
import { AuthContext } from '../../context/AuthContext';
import UserTable from '../../components/UserTable';
import UserForm from '../../components/UserForm';
import { Button } from '../../components/ui/Button';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { Plus } from 'lucide-react';
import { showToast } from '../../utils/toast';

const ClinicalUsers = () => {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, userId: null, userName: '' });
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useContext(AuthContext);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await api.get('/users/clinical', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (error) {
      console.error('Failed to fetch clinical users', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateOrUpdate = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      if (editingUser) {
        await api.put(`/users/${editingUser._id}`, formData, config);
        showToast.success('User updated successfully.');
      } else {
        await api.post('/users', formData, config);
        showToast.success('User created successfully.');
      }
      
      setIsModalOpen(false);
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Action failed.');
    }
  };

  const handleDelete = (userToDelete) => {
    setDeleteConfirm({ isOpen: true, userId: userToDelete._id, userName: userToDelete.name });
  };

  const executeDelete = async () => {
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/users/${deleteConfirm.userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast.success('User deleted successfully.');
      setDeleteConfirm({ isOpen: false, userId: null, userName: '' });
      fetchUsers();
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Failed to delete user.');
      console.error('Failed to delete', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-textPrimary tracking-tight">Clinical Users</h1>
          <p className="text-textSecondary text-sm mt-1">Manage doctors, nurses, and clinical staff.</p>
        </div>
        <Button onClick={() => { setEditingUser(null); setIsModalOpen(true); }} className="shrink-0">
          <Plus size={18} className="mr-2" />
          Create Clinical User
        </Button>
      </div>

      <UserTable 
        users={users} 
        onEdit={(u) => { setEditingUser(u); setIsModalOpen(true); }} 
        onDelete={handleDelete} 
      />

      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, userId: null, userName: '' })}
        onConfirm={executeDelete}
        title="Delete User"
        description={`Are you sure you want to delete "${deleteConfirm.userName}"? This action cannot be undone.`}
        confirmText="Delete"
        isLoading={isDeleting}
      />

      {isModalOpen && (
        <UserForm
          initialData={editingUser}
          role="clinical"
          onSubmit={handleCreateOrUpdate}
          onClose={() => { setIsModalOpen(false); setEditingUser(null); }}
        />
      )}
    </div>
  );
};

export default ClinicalUsers;
