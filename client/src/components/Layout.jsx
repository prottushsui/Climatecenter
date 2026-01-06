import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Carbon Tracker', path: '/carbon', icon: '🌱' },
    { name: 'Climate News', path: '/news', icon: '📰' },
    { name: 'Community', path: '/community', icon: '💬' },
    { name: 'Profile', path: '/profile', icon: '👤' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar toggle */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-md bg-green-600 text-white"
        >
          ☰
        </button>
      </div>

      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 w-64 bg-green-700 text-white z-40 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 transition-transform duration-300 ease-in-out`}
      >
        <div className="p-6 border-b border-green-600">
          <h1 className="text-xl font-bold">Climate Platform</h1>
          <p className="text-sm text-green-200 mt-1">Track, Learn, Engage</p>
        </div>
        
        <nav className="p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center p-3 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-green-600 text-white'
                      : 'hover:bg-green-600 text-green-100'
                  }`}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="absolute bottom-0 w-full p-4 border-t border-green-600">
          <div className="flex items-center">
            <div className="bg-green-200 text-green-800 rounded-full w-10 h-10 flex items-center justify-center font-bold mr-3">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="font-medium">{user?.name}</p>
              <p className="text-sm text-green-200">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="mt-4 w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main content */}
      <div className="md:ml-64">
        <header className="bg-white shadow-sm">
          <div className="px-4 py-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">
              {location.pathname.replace('/', '').replace(/^\w/, (c) => c.toUpperCase()) || 'Dashboard'}
            </h2>
            <div className="hidden md:flex items-center">
              <div className="mr-4">
                <span className="text-gray-600">Welcome, {user?.name}</span>
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </header>
        
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;