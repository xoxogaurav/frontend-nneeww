import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, Bell, User, Users } from 'lucide-react';
import toast from 'react-hot-toast';

interface AdvertiserHeaderProps {
  onLogout: () => void;
}

export default function AdvertiserHeader({ onLogout }: AdvertiserHeaderProps) {
  const { user } = useAuth();

  const handleSwitchToUser = () => {
    window.location.href = '/';
    toast.success('Switched to User Mode');
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl font-bold text-indigo-600">TaskFlow</span>
            </div>
            <span className="ml-4 text-sm text-gray-500">Advertiser Dashboard</span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={handleSwitchToUser}
              className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Users className="h-4 w-4 mr-2" />
              Switch to User Mode
            </button>

            <div className="flex items-center space-x-2">
              <div className="text-sm text-gray-600">
                {user?.name}
              </div>
              <User className="h-5 w-5 text-gray-400" />
            </div>

            <button
              onClick={onLogout}
              className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}