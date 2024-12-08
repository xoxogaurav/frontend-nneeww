import React, { useState, useRef, useEffect } from 'react';
import { 
  Bell, 
  Menu, 
  User, 
  Search, 
  LogOut, 
  Settings, 
  X, 
  Home,
  History,
  Users,
  LayoutDashboard,
  Wallet,
  Share2,
  Megaphone
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAdminMode } from '../contexts/AdminModeContext';
import { NotificationService } from '../services';
import NotificationPanel from './NotificationPanel';
import toast from 'react-hot-toast';

type Screen = 'dashboard' | 'wallet' | 'history' | 'settings' | 'referrals';

interface HeaderProps {
  currentScreen: string;
  onScreenChange: (screen: Screen) => void;
  onSearch: (query: string) => void;
  searchQuery: string;
}

export default function Header({ currentScreen, onScreenChange, onSearch, searchQuery }: HeaderProps) {
  const { user, logout } = useAuth();
  const { isAdminMode, toggleAdminMode } = useAdminMode();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!user?.id) return;
      try {
        const notifications = await NotificationService.getNotifications();
        setUnreadCount(notifications.filter(n => !n.isRead).length);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user?.id]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationPanelOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleScreenChange = (screen: Screen) => {
    onScreenChange(screen);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
  };

  const handleAdminModeToggle = () => {
    toggleAdminMode();
    setIsDropdownOpen(false);
    toast.success(`Switched to ${!isAdminMode ? 'Admin' : 'User'} Mode`);
  };

  const handleAdvertiserDashboard = () => {
    window.location.href = '/advertiser';
    setIsDropdownOpen(false);
  };

  const handleNotificationPanelClose = () => {
    setIsNotificationPanelOpen(false);
    if (user?.id) {
      NotificationService.getNotifications().then(notifications => {
        setUnreadCount(notifications.filter(n => !n.isRead).length);
      });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 cursor-pointer" onClick={() => handleScreenChange('dashboard')}>
              <span className="text-2xl font-bold text-indigo-600">TaskFlow</span>
            </div>
            <nav className="hidden md:ml-8 md:flex md:space-x-8">
              <button
                onClick={() => handleScreenChange('dashboard')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentScreen === 'dashboard' ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-600'
                }`}
              >
                Tasks
              </button>
              <button
                onClick={() => handleScreenChange('wallet')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentScreen === 'wallet' ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-600'
                }`}
              >
                Wallet
              </button>
              <button
                onClick={() => handleScreenChange('history')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentScreen === 'history' ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-600'
                }`}
              >
                History
              </button>
              <button
                onClick={() => handleScreenChange('referrals')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentScreen === 'referrals' ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-600'
                }`}
              >
                Referrals
              </button>
            </nav>
          </div>

          {currentScreen === 'dashboard' && (
            <div className="hidden md:flex flex-1 max-w-lg mx-8">
              <div className="w-full relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => onSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          <div className="flex items-center space-x-4">
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setIsNotificationPanelOpen(!isNotificationPanelOpen)}
                className="p-2 rounded-full text-gray-500 hover:text-indigo-600 focus:outline-none"
              >
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              {isNotificationPanelOpen && (
                <div className="fixed inset-0 z-50 md:relative md:inset-auto">
                  <div className="absolute inset-0 bg-black bg-opacity-25 md:hidden" />
                  <NotificationPanel 
                    onClose={handleNotificationPanelClose}
                    onNotificationUpdate={(newUnreadCount) => setUnreadCount(newUnreadCount)}
                  />
                </div>
              )}
            </div>
            
            <div className="relative hidden md:block" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 p-2 rounded-full text-gray-500 hover:text-indigo-600 focus:outline-none"
              >
                <User className="h-6 w-6" />
                <span className="hidden md:inline-block text-sm font-medium">{user?.name}</span>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                  <div className="py-1">
                    {user?.is_admin && (
                      <button
                        onClick={handleAdminModeToggle}
                        className="flex items-center w-full px-4 py-2 text-sm text-indigo-700 hover:bg-gray-100"
                      >
                        {isAdminMode ? (
                          <>
                            <Users className="h-4 w-4 mr-2" />
                            Switch to User Mode
                          </>
                        ) : (
                          <>
                            <LayoutDashboard className="h-4 w-4 mr-2" />
                            Switch to Admin Mode
                          </>
                        )}
                      </button>
                    )}
                    {user?.is_advertiser && (
                      <button
                        onClick={handleAdvertiserDashboard}
                        className="flex items-center w-full px-4 py-2 text-sm text-indigo-700 hover:bg-gray-100"
                      >
                        <Megaphone className="h-4 w-4 mr-2" />
                        Advertiser Dashboard
                      </button>
                    )}
                    <button
                      onClick={() => {
                        handleScreenChange('settings');
                        setIsDropdownOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-gray-100"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-full text-gray-500 hover:text-indigo-600 focus:outline-none"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Search */}
      {currentScreen === 'dashboard' && (
        <div className="md:hidden px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 md:hidden"
        >
          <div className="grid grid-cols-5 gap-1 p-2">
            <button
              onClick={() => handleScreenChange('dashboard')}
              className={`flex flex-col items-center justify-center p-2 rounded-lg ${
                currentScreen === 'dashboard' ? 'text-indigo-600' : 'text-gray-500'
              }`}
            >
              <Home className="h-6 w-6" />
              <span className="text-xs mt-1">Tasks</span>
            </button>
            <button
              onClick={() => handleScreenChange('wallet')}
              className={`flex flex-col items-center justify-center p-2 rounded-lg ${
                currentScreen === 'wallet' ? 'text-indigo-600' : 'text-gray-500'
              }`}
            >
              <Wallet className="h-6 w-6" />
              <span className="text-xs mt-1">Wallet</span>
            </button>
            <button
              onClick={() => handleScreenChange('history')}
              className={`flex flex-col items-center justify-center p-2 rounded-lg ${
                currentScreen === 'history' ? 'text-indigo-600' : 'text-gray-500'
              }`}
            >
              <History className="h-6 w-6" />
              <span className="text-xs mt-1">History</span>
            </button>
            <button
              onClick={() => handleScreenChange('referrals')}
              className={`flex flex-col items-center justify-center p-2 rounded-lg ${
                currentScreen === 'referrals' ? 'text-indigo-600' : 'text-gray-500'
              }`}
            >
              <Share2 className="h-6 w-6" />
              <span className="text-xs mt-1">Referrals</span>
            </button>
            <button
              onClick={() => handleScreenChange('settings')}
              className={`flex flex-col items-center justify-center p-2 rounded-lg ${
                currentScreen === 'settings' ? 'text-indigo-600' : 'text-gray-500'
              }`}
            >
              <Settings className="h-6 w-6" />
              <span className="text-xs mt-1">Settings</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}