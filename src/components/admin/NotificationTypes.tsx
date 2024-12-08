import React from 'react';
import { Bell, Users } from 'lucide-react';

interface NotificationTypesProps {
  selectedType: 'targeted' | 'broadcast';
  onTypeChange: (type: 'targeted' | 'broadcast') => void;
}

export default function NotificationTypes({ selectedType, onTypeChange }: NotificationTypesProps) {
  return (
    <div className="flex gap-4 mb-6">
      <button
        onClick={() => onTypeChange('targeted')}
        className={`flex items-center px-4 py-2 rounded-lg ${
          selectedType === 'targeted'
            ? 'bg-indigo-600 text-white'
            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
        }`}
      >
        <Users className="h-4 w-4 mr-2" />
        Targeted Notification
      </button>
      <button
        onClick={() => onTypeChange('broadcast')}
        className={`flex items-center px-4 py-2 rounded-lg ${
          selectedType === 'broadcast'
            ? 'bg-indigo-600 text-white'
            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
        }`}
      >
        <Bell className="h-4 w-4 mr-2" />
        Broadcast to All
      </button>
    </div>
  );
}