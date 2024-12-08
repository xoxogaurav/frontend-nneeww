import { useState, useEffect } from 'react';
import { NotificationService } from '../services';

export function useNotificationPermission() {
  const [shouldShowDialog, setShouldShowDialog] = useState(false);

  useEffect(() => {
    const checkPermission = async () => {
      // Check if we've already asked for permission
      const storedPermission = localStorage.getItem('notificationPermission');
      
      // Show dialog if we haven't asked before and user is logged in
      if (!storedPermission && localStorage.getItem('token')) {
        // If permission is already granted in browser, initialize Pushy
        if (Notification.permission === 'granted') {
          try {
            const deviceToken = await NotificationService.initializePushy();
            if (deviceToken) {
              await NotificationService.registerFCMToken(deviceToken);
              localStorage.setItem('notificationPermission', 'granted');
              return;
            }
          } catch (error) {
            console.error('Failed to initialize notifications:', error);
          }
        }

        // Wait a few seconds before showing the dialog
        const timer = setTimeout(() => {
          setShouldShowDialog(true);
        }, 3000);

        return () => clearTimeout(timer);
      }
    };

    checkPermission();
  }, []);

  return {
    shouldShowDialog,
    setShouldShowDialog
  };
}