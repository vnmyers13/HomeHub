/**
 * Admin page for managing family members
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '../../api/users';
import type { User } from '../../api/auth';
import type { CreateUserRequest, UpdateUserRequest } from '../../api/users';

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin', description: 'Full access to all features' },
  { value: 'co_admin', label: 'Co-Admin', description: 'Can manage users and settings' },
  { value: 'teen', label: 'Teen', description: 'Standard access with PIN login' },
  { value: 'child', label: 'Child', description: 'Simplified interface with PIN login' },
  { value: 'guest', label: 'Guest', description: 'Limited access' },
] as const;

const COLOR_PRESETS = [
  '#4F46E5', // Indigo
  '#EF4444', // Red
  '#10B981', // Green
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#F97316', // Orange
];

export default function ManageUsers() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const { data: users, isLoading } = useUsers();
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<User | null>(null);
  
  const [formData, setFormData] = useState<CreateUserRequest>({
    display_name: '',
    role: 'child',
    color_hex: COLOR_PRESETS[0],
    ui_mode: 'standard',
    avatar_type: 'emoji',
    avatar_value: '👤',
    pin: '',
    password: '',
  });

  // Redirect if not admin or co_admin
  if (currentUser && currentUser.role !== 'admin' && currentUser.role !== 'co_admin') {
    navigate('/dashboard');
    return null;
  }

  const handleOpenSheet = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        display_name: user.display_name,
        role: user.role,
        color_hex: user.color_hex,
        ui_mode: user.ui_mode,
        avatar_type: user.avatar_type,
        avatar_value: user.avatar_value,
        pin: '',
        password: '',
      });
    } else {
      setEditingUser(null);
      setFormData({
        display_name: '',
        role: 'child',
        color_hex: COLOR_PRESETS[0],
        ui_mode: 'standard',
        avatar_type: 'emoji',
        avatar_value: '👤',
        pin: '',
        password: '',
      });
    }
    setIsSheetOpen(true);
  };

  const handleCloseSheet = () => {
    setIsSheetOpen(false);
    setEditingUser(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingUser) {
        // Update existing user
        const updateData: UpdateUserRequest = {
          display_name: formData.display_name,
          role: formData.role,
          color_hex: formData.color_hex,
          ui_mode: formData.ui_mode,
          avatar_type: formData.avatar_type,
          avatar_value: formData.avatar_value,
        };
        
        // Only include PIN/password if provided
        if (formData.pin) {
          updateData.pin = formData.pin;
        }
        if (formData.password) {
          updateData.password = formData.password;
        }

        await updateUserMutation.mutateAsync({
          id: editingUser.id,
          data: updateData,
        });
      } else {
        // Create new user
        await createUserMutation.mutateAsync(formData);
      }
      
      handleCloseSheet();
    } catch (error) {
      console.error('Failed to save user:', error);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmUser) return;

    try {
      await deleteUserMutation.mutateAsync(deleteConfirmUser.id);
      setDeleteConfirmUser(null);
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Manage Users
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Add, edit, or remove family members
            </p>
          </div>
          <button
            onClick={() => handleOpenSheet()}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Add Member
          </button>
        </div>

        {/* Users List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users?.map((user) => (
            <div
              key={user.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
                    style={{ backgroundColor: user.color_hex + '20' }}
                  >
                    {user.avatar_type === 'emoji' ? (
                      <span>{user.avatar_value}</span>
                    ) : (
                      <img
                        src={user.avatar_value}
                        alt={user.display_name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {user.display_name}
                    </h3>
                    <span
                      className="inline-block px-2 py-1 text-xs font-medium rounded"
                      style={{
                        backgroundColor: user.color_hex + '20',
                        color: user.color_hex,
                      }}
                    >
                      {ROLE_OPTIONS.find((r) => r.value === user.role)?.label || user.role}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenSheet(user)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => setDeleteConfirmUser(user)}
                  disabled={user.id === currentUser?.id}
                  className="flex-1 px-4 py-2 border border-red-300 dark:border-red-600 rounded-lg text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Edit/Create Sheet */}
        {isSheetOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-end">
            <div className="bg-white dark:bg-gray-800 w-full max-w-md h-full overflow-y-auto p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingUser ? 'Edit Member' : 'Add Member'}
                </h2>
                <button
                  onClick={handleCloseSheet}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Display Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={formData.display_name}
                    onChange={(e) =>
                      setFormData({ ...formData, display_name: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        role: e.target.value as CreateUserRequest['role'],
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    {ROLE_OPTIONS.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label} - {role.description}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Color
                  </label>
                  <div className="flex gap-2">
                    {COLOR_PRESETS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, color_hex: color })}
                        className={`w-10 h-10 rounded-full border-2 ${
                          formData.color_hex === color
                            ? 'border-gray-900 dark:border-white'
                            : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                {/* UI Mode */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    UI Mode
                  </label>
                  <select
                    value={formData.ui_mode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ui_mode: e.target.value as CreateUserRequest['ui_mode'],
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="standard">Standard</option>
                    <option value="child">Child (Simplified)</option>
                    <option value="kiosk">Kiosk (Read-only)</option>
                  </select>
                </div>

                {/* PIN */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    PIN {editingUser && '(leave blank to keep current)'}
                  </label>
                  <input
                    type="text"
                    value={formData.pin}
                    onChange={(e) =>
                      setFormData({ ...formData, pin: e.target.value })
                    }
                    placeholder="4-8 digits"
                    pattern="[0-9]{4,8}"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password {editingUser && '(leave blank to keep current)'}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="Optional"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                {/* Submit */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleCloseSheet}
                    className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createUserMutation.isPending || updateUserMutation.isPending}
                    className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {editingUser ? 'Save Changes' : 'Add Member'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        {deleteConfirmUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Delete Member?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete {deleteConfirmUser.display_name}? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmUser(null)}
                  className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteUserMutation.isPending}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleteUserMutation.isPending ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
