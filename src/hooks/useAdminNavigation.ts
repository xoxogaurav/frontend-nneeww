import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { redirectToDashboard } from '../utils/navigation';
import toast from 'react-hot-toast';

export function useAdminNavigation() {
  const { user } = useAuth();

  useEffect(() => {
    // Check if we're in admin route but user is not admin
    if (window.location.pathname.startsWith('/admin') && !isAdmin()) {
      toast.error('Access denied. Admin privileges required.');
      redirectToDashboard();
    }
  }, [user?.is_admin]);

  const isAdmin = () => {
    // Check both localStorage and user context
    return localStorage.getItem('isAdmin') === 'true' && user?.is_admin === true;
  };

  return {
    isAdmin: isAdmin(),
    redirectToDashboard
  };
}