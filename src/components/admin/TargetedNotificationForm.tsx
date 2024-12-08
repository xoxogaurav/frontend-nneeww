import React, { useState, useEffect } from 'react';
import { Bell, Send, AlertCircle, Link, Volume2, Badge } from 'lucide-react';
import { AdminService, UserService } from '../../services';
import UserSearchSelect from './UserSearchSelect';
import toast from 'react-hot-toast';
import DebugPanel from '../DebugPanel';

interface User {
  id: number;
  name: string;
  email: string;
}

interface NotificationData {
  title: string;
  message: string;
  data: {
    message: string;
  };
  notification: {
    title: string;
    body: string;
    badge: number;
    sound: string;
    url?: string;
  };
  user_ids: number[];
}

interface TargetedNotificationFormProps {
  onSuccess: () => void;
}

export default function TargetedNotificationForm({ onSuccess }: TargetedNotificationFormProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [notificationData, setNotificationData] = useState<NotificationData>({
    title: '',
    message: '',
    data: {
      message: ''
    },
    notification: {
      title: '',
      body: '',
      badge: 1,
      sound: 'ping.aiff',
      url: ''
    },
    user_ids: []
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await UserService.getUsers();
        setUsers(response);
      } catch (error) {
        console.error('Failed to fetch users:', error);
        toast.error('Failed to load users');
      }
    };
    fetchUsers();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    section?: 'notification' | 'data'
  ) => {
    const { name, value } = e.target;

    if (section) {
      setNotificationData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [name]: value
        }
      }));
    } else {
      setNotificationData(prev => ({
        ...prev,
        [name]: value,
        data: {
          ...prev.data,
          message: section === 'data' ? value : prev.data.message
        }
      }));
    }
  };

  const handleUserSelect = (userId: number, checked: boolean) => {
    setSelectedUsers(prev => 
      checked ? [...prev, userId] : prev.filter(id => id !== userId)
    );
  };

  const handleSubmit = async () => {
    if (!notificationData.title || !notificationData.message) {
      toast.error('Please provide both title and message');
      return;
    }

    if (selectedUsers.length === 0) {
      toast.error('Please select at least one user');
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        ...notificationData,
        user_ids: selectedUsers
      };

      // Update debug info with request details
      setDebugInfo({
        request: {
          method: 'POST',
          url: 'https://bookmaster.fun/api/admin/notifications/send',
          data: payload
        }
      });

      await AdminService.sendNotification(payload);

      // Update debug info with response
      setDebugInfo(prev => ({
        ...prev,
        response: {
          status: 200,
          data: { success: true }
        }
      }));

      toast.success('Notification sent successfully');
      onSuccess();
      
      // Reset form
      setNotificationData({
        title: '',
        message: '',
        data: { message: '' },
        notification: {
          title: '',
          body: '',
          badge: 1,
          sound: 'ping.aiff',
          url: ''
        },
        user_ids: []
      });
      setSelectedUsers([]);
    } catch (error: any) {
      console.error('Failed to send notification:', error);
      
      // Update debug info with error
      setDebugInfo(prev => ({
        ...prev,
        response: {
          status: error.response?.status || 500,
          error: error.message,
          data: error.response?.data
        }
      }));

      toast.error(error.message || 'Failed to send notification');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* User Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Recipients
        </label>
        <UserSearchSelect
          users={users}
          selectedUsers={selectedUsers}
          onUserSelect={handleUserSelect}
        />
      </div>

      {/* Basic Notification Details */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notification Title
          </label>
          <input
            type="text"
            name="title"
            value={notificationData.title}
            onChange={e => handleInputChange(e)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter notification title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Message
          </label>
          <textarea
            name="message"
            value={notificationData.message}
            onChange={e => handleInputChange(e)}
            rows={3}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter notification message"
          />
        </div>
      </div>

      {/* Push Notification Details */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Push Notification Settings
        </h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Push Title
          </label>
          <input
            type="text"
            name="title"
            value={notificationData.notification.title}
            onChange={e => handleInputChange(e, 'notification')}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter push notification title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Push Body
          </label>
          <textarea
            name="body"
            value={notificationData.notification.body}
            onChange={e => handleInputChange(e, 'notification')}
            rows={2}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter push notification body"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Badge Count
            </label>
            <input
              type="number"
              name="badge"
              value={notificationData.notification.badge}
              onChange={e => handleInputChange(e, 'notification')}
              min="0"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sound
            </label>
            <input
              type="text"
              name="sound"
              value={notificationData.notification.sound}
              onChange={e => handleInputChange(e, 'notification')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="ping.aiff"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Action URL (Optional)
          </label>
          <input
            type="url"
            name="url"
            value={notificationData.notification.url}
            onChange={e => handleInputChange(e, 'notification')}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="https://example.com"
          />
        </div>
      </div>

      {/* Warning Message */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-yellow-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Important Note
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                Notifications will only be delivered to users who have enabled notifications
                in their browsers and granted permission to receive them.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Send Button */}
      <button
        onClick={handleSubmit}
        disabled={isLoading || !notificationData.title || !notificationData.message || selectedUsers.length === 0}
        className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
      >
        {isLoading ? (
          'Sending...'
        ) : (
          <>
            <Send className="h-4 w-4 mr-2" />
            Send Notification
          </>
        )}
      </button>

      {/* Debug Panel */}
      <DebugPanel
        request={debugInfo?.request}
        response={debugInfo?.response}
      />
    </div>
  );
}