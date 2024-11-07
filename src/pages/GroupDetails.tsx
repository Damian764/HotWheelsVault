import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGroupStore } from '../store/groupStore';
import { useCollectionStore } from '../store/collectionStore';
import { useAuthStore } from '../store/authStore';
import {
  Globe,
  Lock,
  Share2,
  Users,
  Plus,
  X,
  Check,
  Copy,
  ExternalLink,
} from 'lucide-react';

export default function GroupDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { groups, updateGroup, generateShareUrl } = useGroupStore();
  const { cars } = useCollectionStore();
  const [showAddCars, setShowAddCars] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const group = groups.find((g) => g.id === id);
  const isOwner = group?.owner_id === user?.id;
  const groupCars = cars.filter((car) => group?.car_ids.includes(car.id));
  const availableCars = cars.filter((car) => !group?.car_ids.includes(car.id));

  useEffect(() => {
    if (!group) {
      navigate('/groups');
    }
  }, [group, navigate]);

  const handleVisibilityToggle = async () => {
    if (!group || !isOwner) return;
    try {
      await updateGroup(group.id, { is_public: !group.is_public });
    } catch (error) {
      console.error('Failed to update visibility:', error);
    }
  };

  const handleShare = async () => {
    if (!group) return;
    setLoading(true);
    try {
      if (!group.share_url) {
        await generateShareUrl(group.id);
      }
      setShowShareModal(true);
    } catch (error) {
      console.error('Failed to generate share URL:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!group?.share_url) return;
    try {
      await navigator.clipboard.writeText(group.share_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  if (!group) return null;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {group.is_public ? (
                <Globe className="h-6 w-6 text-green-500" />
              ) : (
                <Lock className="h-6 w-6 text-gray-400" />
              )}
              <h1 className="text-2xl font-bold text-gray-900">{group.name}</h1>
            </div>
            {isOwner && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleVisibilityToggle}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  {group.is_public ? 'Make Private' : 'Make Public'}
                </button>
                <button
                  onClick={handleShare}
                  disabled={loading}
                  className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <Share2 className="h-5 w-5 mr-2" />
                  Share
                </button>
              </div>
            )}
          </div>

          <p className="mt-2 text-gray-500">{group.description}</p>

          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Cars</h2>
              {isOwner && (
                <button
                  onClick={() => setShowAddCars(true)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Cars
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {groupCars.map((car) => (
                <div
                  key={car.id}
                  className="relative group bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  {car.photos?.[0] && (
                    <img
                      src={car.photos[0]}
                      alt={car.model}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {car.model}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {car.year} • {car.series}
                    </p>
                  </div>
                  {isOwner && (
                    <button
                      onClick={() => {
                        const updatedCarIds = group.car_ids.filter(
                          (id) => id !== car.id
                        );
                        updateGroup(group.id, { car_ids: updatedCarIds });
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-100 rounded-full text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Members</h2>
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-500">
                {group.members.length} members
              </span>
            </div>
          </div>
        </div>
      </div>

      {showAddCars && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Add Cars</h2>
              <button
                onClick={() => setShowAddCars(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 max-h-96 overflow-y-auto">
              {availableCars.map((car) => (
                <div
                  key={car.id}
                  className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50"
                >
                  {car.photos?.[0] && (
                    <img
                      src={car.photos[0]}
                      alt={car.model}
                      className="h-16 w-16 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">
                      {car.model}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {car.year} • {car.series}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const updatedCarIds = [...group.car_ids, car.id];
                      updateGroup(group.id, { car_ids: updatedCarIds });
                    }}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showShareModal && group.share_url && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Share Group</h2>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={group.share_url}
                  readOnly
                  className="flex-1 p-2 border rounded-md bg-gray-50"
                />
                <button
                  onClick={copyToClipboard}
                  className="p-2 text-gray-400 hover:text-indigo-600 rounded-full hover:bg-gray-100"
                >
                  {copied ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                </button>
              </div>

              <a
                href={group.share_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-500"
              >
                Open in new tab
                <ExternalLink className="h-4 w-4 ml-1" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}