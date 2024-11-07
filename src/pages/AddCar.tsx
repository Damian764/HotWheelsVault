import React from 'react';
import { CarForm } from '../components/CarForm';
import { useCollectionStore } from '../store/collectionStore';

export default function AddCar() {
  const { addCar } = useCollectionStore();

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Car</h1>
      <div className="bg-white shadow-sm rounded-lg p-6">
        <CarForm onSubmit={addCar} buttonText="Add Car" />
      </div>
    </div>
  );
}