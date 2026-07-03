import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import UserTable from '../../components/UserTable';
import UserForm from '../../components/UserForm';
import { Button } from '../../components/ui/Button';
import { Plus } from 'lucide-react';

const InventoryUsers = () => {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const { user } = useContext(AuthContext);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/users/inventory', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (error) {
      console.error('Failed to fetch inventory users', error);
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
        await axios.put(`http://localhost:5000/api/users/${editingUser._id}`, formData, config);
      } else {
        await axios.post('http://localhost:5000/api/users', formData, config);
      }
      
      setIsModalOpen(false);
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || 'Action failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchUsers();
      } catch (error) {
        console.error('Failed to delete', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-textPrimary tracking-tight">Inventory Users</h1>
          <p className="text-textSecondary text-sm mt-1">Manage staff responsible for stock and supplies.</p>
        </div>
        <Button onClick={() => { setEditingUser(null); setIsModalOpen(true); }} className="shrink-0">
          <Plus size={18} className="mr-2" />
          Create Inventory User
        </Button>
      </div>

      <UserTable 
        users={users} 
        onEdit={(user) => { setEditingUser(user); setIsModalOpen(true); }} 
        onDelete={handleDelete} 
      />

      {isModalOpen && (
        <UserForm
          initialData={editingUser}
          role="inventory"
          onSubmit={handleCreateOrUpdate}
          onClose={() => { setIsModalOpen(false); setEditingUser(null); }}
        />
      )}
    </div>
  );
};

export default InventoryUsers;
