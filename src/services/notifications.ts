import api from './api';
import type { Notification } from '../db/database';
import { db } from '../db/database';
import Pushy from 'pushy-sdk-web';
import PushNotificationService from './pushNotifications';

export interface NotificationResponse {
  success: boolean;
  data: Notification[];
}

class NotificationService {
  private static instance: NotificationService;
  private cachedNotifications: Notification[] | null = null;
  private pushyInitialized: boolean = false;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  public async initializePushy(): Promise<string> {
    if (this.pushyInitialized) {
      throw new Error('Pushy already initialized');
    }

    try {
      // Initialize push notifications
      const deviceToken = await PushNotificationService.initialize();

      // Listen for push notifications
      Pushy.setNotificationListener((data) => {
        // Check if the browser supports notifications
        if ('Notification' in window && Notification.permission === 'granted') {
          // Create notification
          const notification = new Notification(data.title || 'New Notification', {
            body: data.message || '',
            icon: '/notification-icon.png'
          });

          // Handle notification click
          notification.onclick = function (event) {
            event.preventDefault();
            window.focus();
            notification.close();
          };
        }

        // Refresh notifications list
        this.getNotifications(true);
      });

      this.pushyInitialized = true;
      return deviceToken;
    } catch (error) {
      console.error('Failed to initialize Pushy:', error);
      throw error;
    }
  }

  public async registerFCMToken(token: string): Promise<void> {
    try {
      await api.post('https://bookmaster.fun/api/notifications/fcm-token', {
        fcm_token: token
      });
    } catch (error) {
      console.error('Failed to register FCM token:', error);
      throw error;
    }
  }

  public async getNotifications(forceRefresh: boolean = false): Promise<Notification[]> {
    try {
      if (!forceRefresh && this.cachedNotifications) {
        return this.cachedNotifications;
      }

      const response = await api.get<NotificationResponse>('/notifications');
      const notifications = response.data.parsed?.data || [];
      
      this.cachedNotifications = notifications;
      await this.syncNotificationsToLocal(notifications);
      
      return notifications;
    } catch (error) {
      if (this.cachedNotifications) {
        return this.cachedNotifications;
      }
      
      const localNotifications = await this.getLocalNotifications();
      this.cachedNotifications = localNotifications;
      return localNotifications;
    }
  }

  public async markAsRead(notificationId: number): Promise<void> {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      
      if (this.cachedNotifications) {
        this.cachedNotifications = this.cachedNotifications.map(notification =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        );
      }
      
      await db.notifications.update(notificationId, { isRead: true });
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to mark notification as read'
      );
    }
  }

  public async markAllAsRead(): Promise<void> {
    try {
      await api.put('/notifications/read-all');
      
      if (this.cachedNotifications) {
        this.cachedNotifications = this.cachedNotifications.map(notification => ({
          ...notification,
          isRead: true
        }));
      }
      
      const userId = await this.getCurrentUserId();
      if (userId) {
        await db.notifications
          .where('userId')
          .equals(userId)
          .modify({ isRead: true });
      }
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to mark all notifications as read'
      );
    }
  }

  public async getUnreadCount(): Promise<number> {
    const notifications = await this.getNotifications();
    return notifications.filter(n => !n.isRead).length;
  }

  private async syncNotificationsToLocal(notifications: Notification[]): Promise<void> {
    const userId = await this.getCurrentUserId();
    if (!userId) return;

    await db.notifications
      .where('userId')
      .equals(userId)
      .delete();

    await db.notifications.bulkAdd(notifications.map(notification => ({
      ...notification,
      userId,
      createdAt: new Date(notification.createdAt)
    })));
  }

  private async getLocalNotifications(): Promise<Notification[]> {
    const userId = await this.getCurrentUserId();
    if (!userId) return [];

    return db.notifications
      .where('userId')
      .equals(userId)
      .reverse()
      .sortBy('createdAt');
  }

  private async getCurrentUserId(): Promise<number | null> {
    try {
      const response = await api.get('/users/profile');
      return response.data.parsed?.data?.id || null;
    } catch {
      return null;
    }
  }

  public clearCache(): void {
    this.cachedNotifications = null;
  }
}

export default NotificationService.getInstance();