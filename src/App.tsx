import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './contexts/AuthContext';
import { useAdminMode } from './contexts/AdminModeContext';
import { useNotificationPermission } from './hooks/useNotificationPermission';
import AuthScreen from './components/auth/AuthScreen';
import AdminDashboard from './components/admin/AdminDashboard';
import AdvertiserDashboard from './components/advertiser/AdvertiserDashboard';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import TaskDetails from './components/TaskDetails';
import WalletScreen from './components/WalletScreen';
import HistoryScreen from './components/HistoryScreen';
import SettingsScreen from './components/SettingsScreen';
import ReferralScreen from './components/ReferralScreen';
import ModeSwitcher from './components/ModeSwitcher';
import NotificationPermissionDialog from './components/NotificationPermissionDialog';
import { Task } from './db/database';

type Screen = 'dashboard' | 'wallet' | 'history' | 'settings' | 'referrals';

function App() {
  const { user, isLoading: authLoading } = useAuth();
  const { isAdminMode } = useAdminMode();
  const { shouldShowDialog, setShouldShowDialog } = useNotificationPermission();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Initialize app state from URL on mount
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/register') {
      setIsRegisterMode(true);
    } else if (path === '/advertiser') {
      // Do nothing, will be handled by routing logic
    } else if (path.slice(1) && ['dashboard', 'wallet', 'history', 'settings', 'referrals'].includes(path.slice(1))) {
      setCurrentScreen(path.slice(1) as Screen);
    }
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Toaster position="top-right" />
        <AuthScreen initialMode={isRegisterMode ? 'signup' : 'login'} />
      </>
    );
  }

  // If user is admin and in admin mode, show admin dashboard
  if (user.is_admin && isAdminMode) {
    return (
      <>
        <Toaster position="top-right" />
        <div className="fixed top-4 right-4 z-50">
          <ModeSwitcher />
        </div>
        <AdminDashboard />
      </>
    );
  }

  // If user is advertiser and on advertiser route, show advertiser dashboard
  if (user.is_advertiser && window.location.pathname === '/advertiser') {
    return (
      <>
        <Toaster position="top-right" />
        <AdvertiserDashboard />
      </>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
        {user.is_admin && (
          <div className="fixed top-4 right-4 z-50">
            <ModeSwitcher />
          </div>
        )}
        <Header 
          currentScreen={currentScreen}
          onScreenChange={setCurrentScreen}
          onSearch={setSearchQuery}
          searchQuery={searchQuery}
        />
        {selectedTask ? (
          <TaskDetails
            task={selectedTask}
            onBack={() => setSelectedTask(null)}
          />
        ) : (
          <>
            {currentScreen === 'dashboard' && (
              <Dashboard onTaskSelect={setSelectedTask} searchQuery={searchQuery} />
            )}
            {currentScreen === 'wallet' && <WalletScreen />}
            {currentScreen === 'history' && <HistoryScreen />}
            {currentScreen === 'settings' && <SettingsScreen />}
            {currentScreen === 'referrals' && <ReferralScreen />}
          </>
        )}

        {shouldShowDialog && (
          <NotificationPermissionDialog 
            onClose={() => setShouldShowDialog(false)} 
          />
        )}
      </div>
    </>
  );
}

export default App;