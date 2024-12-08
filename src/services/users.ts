import api from './api';
import type { User } from '../db/database';

export interface ProfileResponse {
  success: boolean;
  data: {
    id: number;
    name: string;
    email: string;
    is_admin: boolean;
    balance: string | number;
    pendingEarnings: string | number;
    totalWithdrawn: string | number;
    tasksCompleted: number;
    successRate: string | number;
    averageRating: string | number;
    country?: string;
    age?: number;
    phoneNumber?: string;
    bio?: string;
    timezone?: string;
    language?: string;
    emailNotifications?: boolean;
  };
}

export interface LeaderboardEntry {
  name: string;
  balance: number;
  tasksCompleted: number;
  profilePicture?: string;
}

export interface LeaderboardResponse {
  success: boolean;
  data: LeaderboardEntry[];
}

export interface ProfileUpdateData {
  name?: string;
  country?: string;
  age?: number;
  phoneNumber?: string;
  bio?: string;
  timezone?: string;
  language?: string;
  emailNotifications?: boolean;
  currentPassword?: string;
  newPassword?: string;
}

export interface UserListResponse {
  success: boolean;
  data: User[];
}

class UserService {
  private static instance: UserService;

  private constructor() {}

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  public async getUsers(): Promise<User[]> {
    try {
      const response = await api.get<UserListResponse>('/admin/users');
      
      if (!response.data.parsed?.success || !response.data.parsed?.data) {
        throw new Error('Invalid response format');
      }

      return response.data.parsed.data;
    } catch (error: any) {
      console.error('Get users error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch users'
      );
    }
  }

  public async getProfile(): Promise<ProfileResponse['data']> {
    try {
      const response = await api.get<ProfileResponse>('/users/profile');
      
      if (!response.data.parsed?.success || !response.data.parsed?.data) {
        throw new Error('Invalid response format');
      }

      // Update admin status in both localStorage and sessionStorage
      const isAdmin = response.data.parsed.data.is_admin;
      localStorage.setItem('isAdmin', String(isAdmin));
      sessionStorage.setItem('isAdmin', String(isAdmin));

      return response.data.parsed.data;
    } catch (error: any) {
      console.error('Get profile error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch profile'
      );
    }
  }

  public async updateProfile(data: ProfileUpdateData): Promise<ProfileResponse['data']> {
    try {
      const response = await api.put<ProfileResponse>('/users/profile', data);
      if (!response.data.parsed?.success || !response.data.parsed?.data) {
        throw new Error('Invalid response format');
      }
      return response.data.parsed.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to update profile'
      );
    }
  }

  public async getLeaderboard(): Promise<LeaderboardEntry[]> {
    try {
      const response = await api.get<LeaderboardResponse>('/users/leaderboard');
      return response.data.parsed?.data || [];
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch leaderboard'
      );
    }
  }
}

export default UserService.getInstance();