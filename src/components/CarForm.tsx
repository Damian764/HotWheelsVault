import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCollectionStore } from '../store/collectionStore';
import { Tag, Plus, X } from 'lucide-react';
import { ImageUpload } from './ImageUpload';

interface CarFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  buttonText: string;
}

export function CarForm({ initialData, onSubmit, buttonText }: CarFormProps) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [photos, setPhotos] = React.useState<string[]>(initialData?.photos || []);
  const [tagInput, setTagInput] = React.useState('');
  const [groupInput, setGroupInput] = React.useState('');
  const [tags, setTags] = React.useState<string[]>(initialData?.tags || []);
  const [groups, setGroups] = React.useState<string[]>(initialData?.groups || []);
  const navigate = useNavigate();
  const { cars } = useCollectionStore();

  // Suggested tags based on existing collection
  const suggestedTags = React.useMemo(() => {
    const allTags = cars.flatMap(car => car.tags || []);
    return [...new Set(allTags)].filter(tag => 
      !tags.includes(tag) && 
      tag.toLowerCase().includes(tagInput.toLowerCase())
    ).slice(0, 5);
  }, [cars, tags, tagInput]);

  // Suggested groups based on existing collection
  const suggestedGroups = React.useMemo(() => {
    const allGroups = cars.flatMap(car => car.groups || []);
    return [...new Set(allGroups)].filter(group => 
      !groups.includes(group) && 
      group.toLowerCase().includes(groupInput.toLowerCase())
    ).slice(0, 5);
  }, [cars, groups, groupInput]);

  const handleAddTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const handleAddGroup = (group: string) => {
    if (group && !groups.includes(group)) {
      setGroups([...groups, group]);
      setGroupInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const removeGroup = (groupToRemove: string) => {
    setGroups(groups.filter(group => group !== groupToRemove));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const carData = {
      model: formData.get('model'),
      year: parseInt(formData.get('year') as string, 10),
      series: formData.get('series'),
      condition: formData.get('condition'),
      rarity: formData.get('rarity'),
      price: parseFloat(formData.get('price') as string),
      acquisition_date: formData.get('acquisition_date'),
      notes: formData.get('notes'),
      photos,
      tags,
      groups,
    };

    try {
      await onSubmit(carData);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="model" className="block text-sm font-medium text-gray-700">
            Model Name
          </label>
          <input
            type="text"
            name="model"
            id="model"
            required
            defaultValue={initialData?.model}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="year" className="block text-sm font-medium text-gray-700">
            Year
          </label>
          <input
            type="number"
            name="year"
            id="year"
            required
            defaultValue={initialData?.year}
            min="1968"
            max={new Date().getFullYear()}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="series" className="block text-sm font-medium text-gray-700">
            Series
          </label>
          <input
            type="text"
            name="series"
            id="series"
            required
            defaultValue={initialData?.series}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="condition" className="block text-sm font-medium text-gray-700">
            Condition
          </label>
          <select
            name="condition"
            id="condition"
            required
            defaultValue={initialData?.condition || 'mint'}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="mint">Mint</option>
            <option value="near-mint">Near Mint</option>
            <option value="excellent">Excellent</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
            <option value="poor">Poor</option>
          </select>
        </div>

        <div>
          <label htmlFor="rarity" className="block text-sm font-medium text-gray-700">
            Rarity
          </label>
          <select
            name="rarity"
            id="rarity"
            required
            defaultValue={initialData?.rarity || 'common'}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="common">Common</option>
            <option value="uncommon">Uncommon</option>
            <option value="rare">Rare</option>
            <option value="super-rare">Super Rare</option>
            <option value="chase">Chase</option>
            <option value="treasure-hunt">Treasure Hunt</option>
            <option value="super-treasure-hunt">Super Treasure Hunt</option>
          </select>
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
            Price
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              name="price"
              id="price"
              required
              step="0.01"
              min="0"
              defaultValue={initialData?.price}
              className="pl-7 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="acquisition_date" className="block text-sm font-medium text-gray-700">
            Acquisition Date
          </label>
          <input
            type="date"
            name="acquisition_date"
            id="acquisition_date"
            required
            defaultValue={initialData?.acquisition_date}
            max={new Date().toISOString().split('T')[0]}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Photos</label>
        <ImageUpload photos={photos} onChange={setPhotos} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tags
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm bg-indigo-100 text-indigo-800"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 text-indigo-600 hover:text-indigo-800"
              >
                <X className="h-4 w-4" />
              </button>
            </span>
          ))}
        </div>
        <div className="relative">
          <div className="flex">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Add a tag"
              className="flex-1 rounded-l-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={() => handleAddTag(tagInput)}
              className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 hover:bg-gray-100"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
          {suggestedTags.length > 0 && tagInput && (
            <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200">
              {suggestedTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleAddTag(tag)}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2"
                >
                  <Tag className="h-4 w-4 text-gray-400" />
                  <span>{tag}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Groups
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {groups.map((group) => (
            <span
              key={group}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm bg-green-100 text-green-800"
            >
              {group}
              <button
                type="button"
                onClick={() => removeGroup(group)}
                className="ml-1 text-green-600 hover:text-green-800"
              >
                <X className="h-4 w-4" />
              </button>
            </span>
          ))}
        </div>
        <div className="relative">
          <div className="flex">
            <input
              type="text"
              value={groupInput}
              onChange={(e) => setGroupInput(e.target.value)}
              placeholder="Add a group"
              className="flex-1 rounded-l-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={() => handleAddGroup(groupInput)}
              className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 hover:bg-gray-100"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
          {suggestedGroups.length > 0 && groupInput && (
            <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200">
              {suggestedGroups.map((group) => (
                <button
                  key={group}
                  type="button"
                  onClick={() => handleAddGroup(group)}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2"
                >
                  <Tag className="h-4 w-4 text-gray-400" />
                  <span>{group}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Notes
        </label>
        <textarea
          name="notes"
          id="notes"
          rows={3}
          defaultValue={initialData?.notes}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="Add any additional notes about the car..."
        />
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Saving...' : buttonText}
        </button>
      </div>
    </form>
  );
}