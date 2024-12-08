import React, { useState } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { NotificationService } from '../services';
import toast from 'react-hot-toast';

interface NotificationPermissionDialogProps {
  onClose: () => void;
}

export default function NotificationPermissionDialog({ onClose }: NotificationPermissionDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAllow = async () => {
    setIsLoading(true);
    try {
      // Request browser notification permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission denied');
      }

      // Initialize Pushy and get device token
      const deviceToken = await NotificationService.initializePushy();

      // Register token with backend
      await NotificationService.registerFCMToken(deviceToken);

      // Store permission in localStorage
      localStorage.setItem('notificationPermission', 'granted');
      
      toast.success('Notifications enabled successfully!');
      onClose();
    } catch (error) {
      console.error('Notification registration error:', error);
      toast.error('Failed to enable notifications. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecline = () => {
    localStorage.setItem('notificationPermission', 'denied');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-indigo-100 rounded-full">
            <Bell className="h-8 w-8 text-indigo-600" />
          </div>
        </div>
        
        <h2 className="text-xl font-semibold text-center mb-2">
          Stay Updated
        </h2>
        
        <p className="text-gray-600 text-center mb-6">
          Get instant notifications about your task approvals, earnings, and important updates.
        </p>

        <div className="space-y-3">
          <button
            onClick={handleAllow}
            disabled={isLoading}
            className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400"
          >
            <Bell className="h-5 w-5 mr-2" />
            {isLoading ? 'Enabling...' : 'Enable Notifications'}
          </button>

          <button
            onClick={handleDecline}
            disabled={isLoading}
            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            <BellOff className="h-5 w-5 mr-2" />
            Maybe Later
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-4">
          You can always change this later in your settings
        </p>
      </div>
    </div>
  );
}