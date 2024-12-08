import React, { useState } from 'react';
import { Bell, Link, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { AdminService } from '../../services';
import toast from 'react-hot-toast';
import DebugPanel from '../DebugPanel';

interface BroadcastFormProps {
  onSuccess: () => void;
}

export default function BroadcastForm({ onSuccess }: BroadcastFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    url: '',
    image: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.message) {
      toast.error('Please provide both title and message');
      return;
    }

    setIsLoading(true);

    try {
      // Update debug info with request details
      setDebugInfo({
        request: {
          method: 'POST',
          url: 'https://bookmaster.fun/api/admin/notifications/broadcast',
          data: formData
        }
      });

      await AdminService.broadcastNotification(formData);

      // Update debug info with success response
      setDebugInfo(prev => ({
        ...prev,
        response: {
          status: 200,
          data: { success: true }
        }
      }));

      toast.success('Broadcast sent successfully');
      onSuccess();
      
      // Reset form
      setFormData({
        title: '',
        message: '',
        url: '',
        image: ''
      });
    } catch (error: any) {
      console.error('Failed to send broadcast:', error);
      
      // Update debug info with error
      setDebugInfo(prev => ({
        ...prev,
        response: {
          status: error.response?.status || 500,
          error: error.message,
          data: error.response?.data
        }
      }));

      toast.error(error.message || 'Failed to send broadcast');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Broadcast Title
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Enter broadcast title"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Message
        </label>
        <textarea
          name="message"
          value={formData.message}
          onChange={handleInputChange}
          rows={3}
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Enter broadcast message"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
          <Link className="h-4 w-4" />
          Action URL (Optional)
        </label>
        <input
          type="url"
          name="url"
          value={formData.url}
          onChange={handleInputChange}
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="https://example.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
          <ImageIcon className="h-4 w-4" />
          Image URL (Optional)
        </label>
        <input
          type="url"
          name="image"
          value={formData.image}
          onChange={handleInputChange}
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-yellow-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Broadcast Information
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                This notification will be sent to all users on the platform.
                Please use this feature responsibly.
              </p>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={isLoading || !formData.title || !formData.message}
        className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
      >
        {isLoading ? (
          'Sending...'
        ) : (
          <>
            <Bell className="h-4 w-4 mr-2" />
            Send Broadcast
          </>
        )}
      </button>

      <DebugPanel
        request={debugInfo?.request}
        response={debugInfo?.response}
      />
    </div>
  );
}