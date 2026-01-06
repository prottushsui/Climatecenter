import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Profile</h2>
        <p className="text-gray-600">Manage your account information</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <p className="p-2 border border-gray-300 rounded-md bg-gray-50">{user?.name}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <p className="p-2 border border-gray-300 rounded-md bg-gray-50">{user?.email}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <p className="p-2 border border-gray-300 rounded-md bg-gray-50 capitalize">{user?.role}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
            <p className="p-2 border border-gray-300 rounded-md bg-gray-50">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">About This Platform</h3>
        <div className="space-y-3">
          <p className="text-gray-700">
            The Climate Engagement Platform helps you track your carbon footprint, stay informed about climate news, 
            and connect with a community passionate about environmental action.
          </p>
          <p className="text-gray-700">
            <strong>Carbon Tracker:</strong> Log and visualize your environmental impact across different categories 
            like transportation, food, and energy usage.
          </p>
          <p className="text-gray-700">
            <strong>Climate News:</strong> Access curated environmental news and bookmark articles that matter to you.
          </p>
          <p className="text-gray-700">
            <strong>Community:</strong> Participate in discussions about climate solutions and environmental initiatives.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;