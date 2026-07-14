import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { Button } from './ui/Button';
import { cn } from '../lib/utils';

const UserTable = ({ users, onEdit, onDelete }) => {
  if (!users || users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white border border-border rounded-xl">
        <p className="text-textSecondary">No users found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden bg-white border border-border rounded-xl shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-textSecondary uppercase bg-slate-50 border-b border-border">
            <tr>
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium">Email</th>
              <th className="px-6 py-4 font-medium">Role</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 font-medium text-textPrimary">{user.name}</td>
                <td className="px-6 py-4 text-textSecondary">{user.email}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={cn(
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      user.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    )}
                  >
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(user)} className="text-textSecondary hover:text-primary">
                    <Edit2 size={16} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(user)} className="text-textSecondary hover:text-danger hover:bg-danger/10">
                    <Trash2 size={16} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserTable;
