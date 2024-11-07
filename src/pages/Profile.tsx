import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useCollectionStore } from '../store/collectionStore';
import { Car, DollarSign, Package, Star, TrendingUp, Trophy, Mail, Lock } from 'lucide-react';

export default function Profile() {
  const { user, signOut, updateEmail, updatePassword } = useAuthStore();
  const { cars } = useCollectionStore();
  const navigate = useNavigate();
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalValue: 0,
    rarityBreakdown: {} as Record<string, number>,
    mostValuableCar: null as any,
    newestAddition: null as any,
    totalCars: 0,
    uniqueSeries: new Set(),
  });

  useEffect(() => {
    const calculateStats = () => {
      const totalValue = cars.reduce((sum, car) => sum + car.price, 0);
      const rarityBreakdown = cars.reduce((acc, car) => {
        acc[car.rarity] = (acc[car.rarity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const mostValuableCar = [...cars].sort((a, b) => b.price - a.price)[0];
      const newestAddition = [...cars].sort(
        (a, b) => new Date(b.acquisition_date).getTime() - new Date(a.acquisition_date).getTime()
      )[0];
      
      const uniqueSeries = new Set(cars.map(car => car.series));

      setStats({
        totalValue,
        rarityBreakdown,
        mostValuableCar,
        newestAddition,
        totalCars: cars.length,
        uniqueSeries,
      });
    };

    calculateStats();
  }, [cars]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await updateEmail(newEmail);
      setSuccess('Email updated successfully');
      setShowEmailForm(false);
      setNewEmail('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await updatePassword(currentPassword, newPassword);
      setSuccess('Password updated successfully');
      setShowPasswordForm(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        {/* Profile Header */}
        <div className="bg-indigo-600 px-6 py-8">
          <div className="flex items-center space-x-4">
            <div className="h-20 w-20 rounded-full bg-indigo-500 flex items-center justify-center">
              <span className="text-3xl text-white">
                {user?.email?.[0].toUpperCase()}
              </span>
            </div>
            <div className="text-white">
              <h1 className="text-2xl font-bold">{user?.email}</h1>
              <p className="text-indigo-200">Member since {new Date(user?.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Collection Stats */}
        <div className="p-6">
          {(error || success) && (
            <div className={`mb-4 p-4 rounded ${error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              {error || success}
            </div>
          )}

          <h2 className="text-xl font-semibold text-gray-900 mb-4">Collection Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-3">
                <Car className="h-6 w-6 text-indigo-600" />
                <div>
                  <p className="text-sm text-gray-500">Total Cars</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalCars}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-3">
                <DollarSign className="h-6 w-6 text-green-600" />
                <div>
                  <p className="text-sm text-gray-500">Collection Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(stats.totalValue)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-3">
                <Package className="h-6 w-6 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-500">Unique Series</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.uniqueSeries.size}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h3>
            
            {/* Email Update Form */}
            <div className="mb-6">
              <button
                onClick={() => setShowEmailForm(!showEmailForm)}
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-indigo-600"
              >
                <Mail className="h-4 w-4" />
                <span>Change Email Address</span>
              </button>
              
              {showEmailForm && (
                <form onSubmit={handleUpdateEmail} className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="newEmail" className="block text-sm font-medium text-gray-700">
                      New Email Address
                    </label>
                    <input
                      type="email"
                      id="newEmail"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      {loading ? 'Updating...' : 'Update Email'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowEmailForm(false)}
                      className="inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Password Update Form */}
            <div className="mb-6">
              <button
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-indigo-600"
              >
                <Lock className="h-4 w-4" />
                <span>Change Password</span>
              </button>
              
              {showPasswordForm && (
                <form onSubmit={handleUpdatePassword} className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                      Current Password
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                      New Password
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      {loading ? 'Updating...' : 'Update Password'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPasswordForm(false)}
                      className="inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Sign Out Button */}
            <button
              onClick={handleSignOut}
              className="mt-4 w-full sm:w-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}