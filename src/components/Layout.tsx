import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Car, LogOut, Plus, Search, User, Users } from 'lucide-react';

export function Layout() {
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <Car className="h-8 w-8" />
                <span className="font-bold text-xl">HotWheels Vault</span>
              </Link>
            </div>

            {user && (
              <div className="flex items-center space-x-4">
                <Link
                  to="/search"
                  className={`p-2 rounded-full ${
                    isActive('/search')
                      ? 'bg-indigo-700'
                      : 'hover:bg-indigo-700'
                  }`}
                >
                  <Search className="h-5 w-5" />
                </Link>
                <Link
                  to="/groups"
                  className={`p-2 rounded-full ${
                    isActive('/groups')
                      ? 'bg-indigo-700'
                      : 'hover:bg-indigo-700'
                  }`}
                >
                  <Users className="h-5 w-5" />
                </Link>
                <Link
                  to="/add"
                  className={`p-2 rounded-full ${
                    isActive('/add')
                      ? 'bg-indigo-700'
                      : 'hover:bg-indigo-700'
                  }`}
                >
                  <Plus className="h-5 w-5" />
                </Link>
                <Link
                  to="/profile"
                  className={`p-2 rounded-full ${
                    isActive('/profile')
                      ? 'bg-indigo-700'
                      : 'hover:bg-indigo-700'
                  }`}
                >
                  <User className="h-5 w-5" />
                </Link>
                <button
                  onClick={handleSignOut}
                  className="p-2 hover:bg-indigo-700 rounded-full"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}