import React from 'react';
import AdminDashboard from '../components/admin/AdminDashboard';
import { useAuth } from '../contexts/AuthContext';
import { redirectToDashboard } from '../utils/navigation';
import toast from 'react-hot-toast';

interface AdminRoutesProps {
  path: string;
}

export default function AdminRoutes({ path }: AdminRoutesProps) {
  const { user } = useAuth();

  // Redirect non-admin users
  React.useEffect(() => {
    if (user && !user.is_admin) {
      toast.error('Access denied. Admin privileges required.');
      redirectToDashboard();
    }
  }, [user]);

  // Show loading state while checking auth
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  // Verify admin status
  if (!user.is_admin) {
    return null;
  }

  // Admin routes mapping
  switch (path) {
    case '/admin':
    case '/admin/dashboard':
      return <AdminDashboard />;
    default:
      return <AdminDashboard />;
  }
}