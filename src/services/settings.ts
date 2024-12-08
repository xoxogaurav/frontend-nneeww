import api from './api';
import type { User } from '../db/database';

export interface UpdateProfileData {
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

class SettingsService {
  private static instance: SettingsService;

  private constructor() {}

  public static getInstance(): SettingsService {
    if (!SettingsService.instance) {
      SettingsService.instance = new SettingsService();
    }
    return SettingsService.instance;
  }

  public async updateProfile(data: UpdateProfileData): Promise<User> {
    try {
      const response = await api.put('/users/profile', data);
      
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

  public async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await api.put('/users/profile', {
        currentPassword,
        newPassword
      });
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to update password'
      );
    }
  }

  public async submitGovernmentId(idUrl: string): Promise<void> {
    try {
      await api.put('https://bookmaster.fun/api/users/id-verify', {
        governmentIdUrl: idUrl
      });
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to submit government ID'
      );
    }
  }
}

export default SettingsService.getInstance();