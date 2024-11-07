import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useGroupStore } from '../store/groupStore';
import { useAuthStore } from '../store/authStore';
import { Plus, Users, Globe, Lock, Share2, Pencil, Trash2, AlertCircle } from 'lucide-react';

export default function Groups() {
  const { groups, loading, error, fetchGroups, createGroup, deleteGroup, clearError } = useGroupStore();
  const { user } = useAuthStore();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const loadGroups = async () => {
      try {
        await fetchGroups();
      } catch (err) {
        // Error is handled in the store
      }
    };
    loadGroups();

    return () => {
      clearError(); // Clear any errors when component unmounts
    };
  }, [fetchGroups, clearError]);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!newGroupName.trim()) {
      setFormError('Group name is required');
      return;
    }

    try {
      await createGroup({
        name: newGroupName.trim(),
        description: newGroupDescription.trim(),
      });
      setShowCreateForm(false);
      setNewGroupName('');
      setNewGroupDescription('');
    } catch (err: any) {
      setFormError(err.message || 'Failed to create group');
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (window.confirm('Are you sure you want to delete this group?')) {
      try {
        await deleteGroup(groupId);
      } catch (err) {
        // Error is handled in the store
      }
    }
  };

  if (loading && groups.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Groups</h1>
        {groups.length < 20 && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Group
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Create New Group
            </h2>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              {formError && (
                <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md">
                  {formError}
                </div>
              )}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Group Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  value={newGroupDescription}
                  onChange={(e) => setNewGroupDescription(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setFormError('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white shadow-sm rounded-lg divide-y divide-gray-200">
        {groups.length === 0 ? (
          <div className="p-6 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No groups yet
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first group.
            </p>
          </div>
        ) : (
          groups.map((group) => (
            <div
              key={group.id}
              className="p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {group.is_public ? (
                      <Globe className="h-6 w-6 text-green-500" />
                    ) : (
                      <Lock className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <Link
                      to={`/groups/${group.id}`}
                      className="text-lg font-medium text-indigo-600 hover:text-indigo-700"
                    >
                      {group.name}
                    </Link>
                    <p className="text-sm text-gray-500">{group.description}</p>
                  </div>
                </div>
                {group.owner_id === user?.id && (
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/groups/${group.id}/edit`}
                      className="p-2 text-gray-400 hover:text-indigo-600 rounded-full hover:bg-gray-100"
                    >
                      <Pencil className="h-5 w-5" />
                    </Link>
                    <button
                      onClick={() => handleDeleteGroup(group.id)}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-100"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-indigo-600 rounded-full hover:bg-gray-100">
                      <Share2 className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
              <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                <span>{group.car_ids?.length || 0} cars</span>
                <span>{group.members?.length || 0} members</span>
                <span>
                  Created{' '}
                  {new Date(group.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}