import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Settings, Lock, Globe, Phone, Mail, Languages, Clock, FileCheck } from 'lucide-react';
import { UserService } from '../services';
import SettingsService from '../services/settings';
import IdVerificationSection from './IdVerificationSection';
import toast from 'react-hot-toast';
import DebugPanel from './DebugPanel';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    country: '',
    age: '',
    phoneNumber: '',
    bio: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: 'en',
    emailNotifications: true,
    governmentIdStatus: 'none' as 'none' | 'pending' | 'approved' | 'rejected',
    governmentIdUrl: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const profile = await UserService.getProfile();
        setFormData(prev => ({
          ...prev,
          name: profile.name || '',
          email: profile.email || '',
          country: profile.country || '',
          age: profile.age?.toString() || '',
          phoneNumber: profile.phoneNumber || '',
          bio: profile.bio || '',
          timezone: profile.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
          language: profile.language || 'en',
          emailNotifications: profile.emailNotifications ?? true,
          governmentIdStatus: profile.governmentIdStatus || 'none',
          governmentIdUrl: profile.governmentIdUrl || ''
        }));

        setDebugInfo({
          request: {
            method: 'GET',
            url: '/users/profile',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          },
          response: {
            status: 200,
            data: profile
          }
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile data');
        
        setDebugInfo(prev => ({
          ...prev,
          response: {
            status: error.response?.status || 500,
            error: error.message,
            data: error.response?.data
          }
        }));
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (formData.newPassword) {
        if (!formData.currentPassword) {
          throw new Error('Current password is required to set a new password');
        }
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error('New passwords do not match');
        }
        if (formData.newPassword.length < 6) {
          throw new Error('New password must be at least 6 characters');
        }
      }

      const updateData = {
        name: formData.name,
        country: formData.country,
        age: formData.age ? parseInt(formData.age) : undefined,
        phoneNumber: formData.phoneNumber,
        bio: formData.bio,
        timezone: formData.timezone,
        language: formData.language,
        emailNotifications: formData.emailNotifications,
        ...(formData.newPassword && {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      };

      // Update debug info with request details
      setDebugInfo({
        request: {
          method: 'PUT',
          url: '/users/profile',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          data: updateData
        }
      });

      const updatedProfile = await SettingsService.updateProfile(updateData);

      setDebugInfo(prev => ({
        ...prev,
        response: {
          status: 200,
          data: updatedProfile
        }
      }));

      toast.success('Settings updated successfully');
      
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (error: any) {
      console.error('Settings update error:', error);
      
      setDebugInfo(prev => ({
        ...prev,
        response: {
          status: error.response?.status || 500,
          error: error.message,
          data: error.response?.data
        }
      }));

      toast.error(error instanceof Error ? error.message : 'Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleIdSubmit = async (idUrl: string) => {
    try {
      // Update debug info with request details
      setDebugInfo({
        request: {
          method: 'PUT',
          url: '/users/profile',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          data: {
            governmentId: idUrl
          }
        }
      });

      await SettingsService.submitGovernmentId(idUrl);
      
      setDebugInfo(prev => ({
        ...prev,
        response: {
          status: 200,
          data: {
            governmentIdUrl: idUrl,
            governmentIdStatus: 'pending'
          }
        }
      }));

      setFormData(prev => ({
        ...prev,
        governmentIdStatus: 'pending',
        governmentIdUrl: idUrl
      }));
    } catch (error: any) {
      console.error('Error submitting ID:', error);
      
      setDebugInfo(prev => ({
        ...prev,
        response: {
          status: error.response?.status || 500,
          error: error.message,
          data: error.response?.data
        }
      }));

      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="mt-1 text-gray-500">Manage your account preferences</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit} className="divide-y divide-gray-200">
            {/* Profile Section */}
            <div className="p-6 space-y-6">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Profile Information
              </h2>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Age</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    min="18"
                    max="120"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={3}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Location & Language Section */}
            <div className="p-6 space-y-6">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                Location & Language
              </h2>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Country</label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="">Select a country</option>
                    <option value="US">United States</option>
                    <option value="GB">United Kingdom</option>
                    <option value="CA">Canada</option>
                    <option value="AU">Australia</option>
                    <option value="IN">India</option>
                    {/* Add more countries as needed */}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Language</label>
                  <select
                    name="language"
                    value={formData.language}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    {/* Add more languages as needed */}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Timezone</label>
                  <select
                    name="timezone"
                    value={formData.timezone}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    {Intl.supportedValuesOf('timeZone').map(timezone => (
                      <option key={timezone} value={timezone}>
                        {timezone}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Password Section */}
            <div className="p-6 space-y-6">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <Lock className="h-5 w-5 mr-2" />
                Change Password
              </h2>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* ID Verification Section */}
            <div className="p-6 space-y-6">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <FileCheck className="h-5 w-5 mr-2" />
                Identity Verification
              </h2>
              
              <IdVerificationSection
                currentStatus={formData.governmentIdStatus}
                currentIdUrl={formData.governmentIdUrl}
                onIdSubmit={handleIdSubmit}
              />
            </div>

            {/* Notifications Section */}
            <div className="p-6 space-y-6">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                Notifications
              </h2>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="emailNotifications"
                    checked={formData.emailNotifications}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    Receive email notifications for task updates and announcements
                  </span>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="px-6 py-4 bg-gray-50 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

    
      </div>
    </div>
  );
}