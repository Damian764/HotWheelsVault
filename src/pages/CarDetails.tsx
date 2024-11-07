import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCollectionStore } from '../store/collectionStore';
import { CarForm } from '../components/CarForm';
import { Pencil, Trash2, Share2 } from 'lucide-react';

export default function CarDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { cars, updateCar, deleteCar } = useCollectionStore();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const car = cars.find((c) => c.id === id);

  useEffect(() => {
    if (!car) {
      navigate('/');
    }
  }, [car, navigate]);

  if (!car) return null;

  const handleDelete = async () => {
    try {
      await deleteCar(id!);
      navigate('/');
    } catch (error) {
      console.error('Failed to delete car:', error);
    }
  };

  const handleShare = () => {
    // TODO: Implement sharing functionality
    alert('Sharing functionality coming soon!');
  };

  if (isEditing) {
    return (
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Car</h1>
        <div className="bg-white shadow-sm rounded-lg p-6">
          <CarForm
            initialData={car}
            onSubmit={(data) => updateCar(id!, data)}
            buttonText="Save Changes"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{car.model}</h1>
        <div className="flex space-x-2">
          <button
            onClick={handleShare}
            className="p-2 text-gray-600 hover:text-indigo-600 rounded-full hover:bg-gray-100"
          >
            <Share2 className="h-5 w-5" />
          </button>
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-gray-600 hover:text-indigo-600 rounded-full hover:bg-gray-100"
          >
            <Pencil className="h-5 w-5" />
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 text-gray-600 hover:text-red-600 rounded-full hover:bg-gray-100"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        {car.photos && car.photos.length > 0 && (
          <div className="aspect-w-16 aspect-h-9">
            <img
              src={car.photos[0]}
              alt={car.model}
              className="object-cover w-full h-full"
            />
          </div>
        )}

        <div className="p-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Year</dt>
              <dd className="mt-1 text-sm text-gray-900">{car.year}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Series</dt>
              <dd className="mt-1 text-sm text-gray-900">{car.series}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Condition</dt>
              <dd className="mt-1 text-sm text-gray-900">{car.condition}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Rarity</dt>
              <dd className="mt-1 text-sm text-gray-900">{car.rarity}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Price</dt>
              <dd className="mt-1 text-sm text-gray-900">${car.price}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Acquired</dt>
              <dd className="mt-1 text-sm text-gray-900">{car.acquisition_date}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Tags</dt>
              <dd className="mt-1 text-sm text-gray-900">
                <div className="flex flex-wrap gap-2">
                  {car.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Groups</dt>
              <dd className="mt-1 text-sm text-gray-900">
                <div className="flex flex-wrap gap-2">
                  {car.groups.map((group) => (
                    <span
                      key={group}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                    >
                      {group}
                    </span>
                  ))}
                </div>
              </dd>
            </div>
            {car.notes && (
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Notes</dt>
                <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                  {car.notes}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Delete Car
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete this car? This action cannot be
              undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}