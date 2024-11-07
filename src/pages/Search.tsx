import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCollectionStore } from '../store/collectionStore';
import { Search as SearchIcon, SlidersHorizontal, Car } from 'lucide-react';

export default function Search() {
  const { cars } = useCollectionStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    yearMin: '',
    yearMax: '',
    condition: '',
    rarity: '',
    priceMin: '',
    priceMax: '',
    series: '',
  });

  const filteredCars = useMemo(() => {
    return cars.filter((car) => {
      // Search term filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        car.model.toLowerCase().includes(searchLower) ||
        car.series.toLowerCase().includes(searchLower) ||
        car.tags.some((tag) => tag.toLowerCase().includes(searchLower)) ||
        car.groups.some((group) => group.toLowerCase().includes(searchLower));

      // Advanced filters
      const matchesYear =
        (!filters.yearMin || car.year >= parseInt(filters.yearMin)) &&
        (!filters.yearMax || car.year <= parseInt(filters.yearMax));

      const matchesCondition = !filters.condition || car.condition === filters.condition;
      const matchesRarity = !filters.rarity || car.rarity === filters.rarity;

      const matchesPrice =
        (!filters.priceMin || car.price >= parseFloat(filters.priceMin)) &&
        (!filters.priceMax || car.price <= parseFloat(filters.priceMax));

      const matchesSeries =
        !filters.series ||
        car.series.toLowerCase().includes(filters.series.toLowerCase());

      return (
        matchesSearch &&
        matchesYear &&
        matchesCondition &&
        matchesRarity &&
        matchesPrice &&
        matchesSeries
      );
    });
  }, [cars, searchTerm, filters]);

  const resetFilters = () => {
    setFilters({
      yearMin: '',
      yearMax: '',
      condition: '',
      rarity: '',
      priceMin: '',
      priceMax: '',
      series: '',
    });
  };

  return (
    <div>
      <div className="mb-6">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search your collection..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <SlidersHorizontal className="h-5 w-5" />
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Year Range</label>
                <div className="mt-1 flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    value={filters.yearMin}
                    onChange={(e) => setFilters({ ...filters, yearMin: e.target.value })}
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    value={filters.yearMax}
                    onChange={(e) => setFilters({ ...filters, yearMax: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Condition</label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={filters.condition}
                  onChange={(e) => setFilters({ ...filters, condition: e.target.value })}
                >
                  <option value="">Any</option>
                  <option value="mint">Mint</option>
                  <option value="near-mint">Near Mint</option>
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Rarity</label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={filters.rarity}
                  onChange={(e) => setFilters({ ...filters, rarity: e.target.value })}
                >
                  <option value="">Any</option>
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
                <label className="block text-sm font-medium text-gray-700">Price Range</label>
                <div className="mt-1 flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    value={filters.priceMin}
                    onChange={(e) => setFilters({ ...filters, priceMin: e.target.value })}
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    value={filters.priceMax}
                    onChange={(e) => setFilters({ ...filters, priceMax: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Series</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={filters.series}
                  onChange={(e) => setFilters({ ...filters, series: e.target.value })}
                  placeholder="Enter series name"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={resetFilters}
                  className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {filteredCars.length === 0 ? (
          <div className="text-center py-12">
            <Car className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No cars found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filters to find what you're looking for.
            </p>
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-lg divide-y divide-gray-200">
            {filteredCars.map((car) => (
              <Link
                key={car.id}
                to={`/car/${car.id}`}
                className="block hover:bg-gray-50"
              >
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {car.photos?.[0] && (
                        <img
                          src={car.photos[0]}
                          alt={car.model}
                          className="h-10 w-10 object-cover rounded"
                        />
                      )}
                      <div>
                        <p className="text-sm font-medium text-indigo-600 truncate">
                          {car.model}
                        </p>
                        <p className="text-sm text-gray-500">
                          {car.year} • {car.series}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {car.condition}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        ${car.price}
                      </span>
                    </div>
                  </div>
                  {(car.tags.length > 0 || car.groups.length > 0) && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {car.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {tag}
                        </span>
                      ))}
                      {car.groups.map((group) => (
                        <span
                          key={group}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800"
                        >
                          {group}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}