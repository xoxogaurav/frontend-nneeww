import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import NotificationTypes from './NotificationTypes';
import TargetedNotificationForm from './TargetedNotificationForm';
import BroadcastForm from './BroadcastForm';

export default function NotificationSender() {
  const [notificationType, setNotificationType] = useState<'targeted' | 'broadcast'>('targeted');

  const handleSuccess = () => {
    // Additional success handling if needed
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Bell className="h-5 w-5 text-indigo-600" />
        <h2 className="text-lg font-semibold text-gray-900">Send Notification</h2>
      </div>

      <NotificationTypes
        selectedType={notificationType}
        onTypeChange={setNotificationType}
      />

      {notificationType === 'targeted' ? (
        <TargetedNotificationForm onSuccess={handleSuccess} />
      ) : (
        <BroadcastForm onSuccess={handleSuccess} />
      )}
    </div>
  );
}