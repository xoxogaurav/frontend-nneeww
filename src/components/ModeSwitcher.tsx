import React from 'react';
import { useAdminMode } from '../contexts/AdminModeContext';
import { LayoutDashboard, Users } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ModeSwitcher() {
  const { isAdminMode, toggleAdminMode } = useAdminMode();

  const handleModeSwitch = () => {
    toggleAdminMode();
    toast.success(`Switched to ${!isAdminMode ? 'Admin' : 'User'} Mode`);
  };

  return (
    <button
      onClick={handleModeSwitch}
      className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
      {isAdminMode ? (
        <>
          <Users className="w-4 h-4 mr-2" />
          Switch to User Mode
        </>
      ) : (
        <>
          <LayoutDashboard className="w-4 h-4 mr-2" />
          Switch to Admin Mode
        </>
      )}
    </button>
  );
}