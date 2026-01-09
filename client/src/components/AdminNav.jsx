import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminNav = () => {
  const { user, isAdmin } = useAuth();

  if (!user || !isAdmin()) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border-b border-yellow-200 p-2">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-yellow-800">
            <span className="font-medium">Admin Panel:</span> You have admin privileges
          </div>
          <Link 
            to="/admin/dashboard" 
            className="text-sm font-medium text-green-700 hover:text-green-900 hover:underline"
          >
            Go to Admin Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminNav;