import React, { useEffect, useState } from 'react';
import { Bell, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { NotificationService } from '../services';
import NotificationItem from './NotificationItem';
import toast from 'react-hot-toast';
import type { Notification } from '../db/database';

interface NotificationPanelProps {
  onClose: () => void;
  onNotificationUpdate: (unreadCount: number) => void;
}

export default function NotificationPanel({ onClose, onNotificationUpdate }: NotificationPanelProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    return () => {
      // Clear cache when component unmounts
      NotificationService.clearCache();
    };
  }, [user?.id]);

  const fetchNotifications = async () => {
    if (!user?.id) return;
    
    try {
      const data = await NotificationService.getNotifications();
      setNotifications(data);
      onNotificationUpdate(data.filter(n => !n.isRead).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await NotificationService.markAsRead(notificationId);
      const updatedNotifications = notifications.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      );
      setNotifications(updatedNotifications);
      onNotificationUpdate(updatedNotifications.filter(n => !n.isRead).length);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await NotificationService.markAllAsRead();
      const updatedNotifications = notifications.map(notification => ({
        ...notification,
        isRead: true
      }));
      setNotifications(updatedNotifications);
      onNotificationUpdate(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };

  const handleClose = () => {
    // Clear cache before closing
    NotificationService.clearCache();
    onClose();
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="fixed md:absolute right-0 top-0 md:top-auto mt-16 md:mt-2 w-full md:w-96 bg-white rounded-none md:rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50 max-h-[calc(100vh-4rem)] md:max-h-[32rem] flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Bell className="h-5 w-5 text-gray-400" />
            <h3 className="ml-2 text-lg font-medium text-gray-900">Notifications</h3>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="mt-2 text-sm text-indigo-600 hover:text-indigo-500"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No notifications
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                {...notification}
                onMarkAsRead={handleMarkAsRead}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}