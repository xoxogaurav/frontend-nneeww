import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface AdminModeContextType {
  isAdminMode: boolean;
  toggleAdminMode: () => void;
}

const AdminModeContext = createContext<AdminModeContextType | null>(null);

export function AdminModeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isAdminMode, setIsAdminMode] = useState(() => {
    // Initialize from localStorage, default to true for admin users
    const stored = localStorage.getItem('adminMode');
    if (stored !== null) {
      return stored === 'true';
    }
    return true;
  });

  // Update localStorage when mode changes
  useEffect(() => {
    localStorage.setItem('adminMode', String(isAdminMode));
  }, [isAdminMode]);

  // Reset to admin mode when user changes
  useEffect(() => {
    if (user?.is_admin) {
      setIsAdminMode(true);
    }
  }, [user?.is_admin]);

  const toggleAdminMode = () => {
    setIsAdminMode(prev => !prev);
  };

  return (
    <AdminModeContext.Provider value={{ isAdminMode, toggleAdminMode }}>
      {children}
    </AdminModeContext.Provider>
  );
}

export function useAdminMode() {
  const context = useContext(AdminModeContext);
  if (!context) {
    throw new Error('useAdminMode must be used within an AdminModeProvider');
  }
  return context;
}