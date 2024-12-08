import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthService, UserService } from '../services';
import toast from 'react-hot-toast';

interface User {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
  is_advertiser?: boolean;
  advertiser_balance?: number;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, country: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const profile = await UserService.getProfile();
          const userData = {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            is_admin: profile.is_admin,
            is_advertiser: profile.is_advertiser,
            advertiser_balance: profile.advertiser_balance
          };
          setUser(userData);
          localStorage.setItem('isAdmin', String(profile.is_admin));
          localStorage.setItem('isAdvertiser', String(profile.is_advertiser));
        } catch (error) {
          console.error('Auth initialization error:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('isAdmin');
          localStorage.removeItem('isAdvertiser');
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await AuthService.login(email, password);
      setUser({
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        is_admin: response.user.is_admin,
        is_advertiser: response.user.is_advertiser,
        advertiser_balance: response.user.advertiser_balance
      });
      toast.success('Welcome back!');
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to login');
      throw error;
    }
  };

  const signup = async (name: string, email: string, password: string, country: string) => {
    try {
      const response = await AuthService.register(name, email, password, country);
      setUser({
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        is_admin: response.user.is_admin,
        is_advertiser: response.user.is_advertiser,
        advertiser_balance: response.user.advertiser_balance
      });
      toast.success('Account created successfully!');
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create account');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AuthService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('isAdmin');
      localStorage.removeItem('isAdvertiser');
      toast.success('Logged out successfully');
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}