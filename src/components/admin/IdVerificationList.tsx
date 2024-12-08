import React, { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Image } from 'lucide-react';
import { AdminService } from '../../services';
import { User } from '../../db/database';
import toast from 'react-hot-toast';
import DebugPanel from '../DebugPanel';

interface IdVerificationListProps {
  verifications: User[];
  onVerificationUpdate: () => void;
}

export default function IdVerificationList({ verifications, onVerificationUpdate }: IdVerificationListProps) {
  const [isProcessing, setIsProcessing] = useState<number | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleVerification = async (userId: number, status: 'approved' | 'rejected') => {
    if (isProcessing) return;
    
    setIsProcessing(userId);
    
    try {
      // Update debug info with request details
      setDebugInfo({
        request: {
          method: 'PUT',
          url: `https://bookmaster.fun/api/admin/${userId}/verify-id`,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          data: { status }
        }
      });

      await AdminService.verifyUserId(userId, status);
      
      setDebugInfo(prev => ({
        ...prev,
        response: {
          status: 200,
          data: { status, userId }
        }
      }));

      toast.success(`ID verification ${status}`);
      onVerificationUpdate();
    } catch (error: any) {
      console.error('Verification error:', error);
      
      setDebugInfo(prev => ({
        ...prev,
        response: {
          status: error.response?.status || 500,
          error: error.message,
          data: error.response?.data
        }
      }));

      toast.error(`Failed to ${status} verification`);
    } finally {
      setIsProcessing(null);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  if (!verifications?.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        No pending verifications
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {verifications.map((user) => (
        <div key={user.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Pending Review
                </span>
              </div>
              <p className="text-sm text-gray-600">Email: {user.email}</p>
              {user.country && (
                <p className="text-sm text-gray-600">Country: {user.country}</p>
              )}
              <p className="text-sm text-gray-500">
                Submitted at: {formatDate(user.created_at)}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleVerification(user.id!, 'approved')}
                disabled={isProcessing === user.id}
                className="flex items-center px-3 py-1 text-sm font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Approve
              </button>
              <button
                onClick={() => handleVerification(user.id!, 'rejected')}
                disabled={isProcessing === user.id}
                className="flex items-center px-3 py-1 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200"
              >
                <XCircle className="h-4 w-4 mr-1" />
                Reject
              </button>
            </div>
          </div>
          
          {user.governmentIdUrl ? (
            <div className="mt-4">
              <img
                src={user.governmentIdUrl}
                alt="Government ID"
                className="w-full h-48 object-cover rounded-lg cursor-pointer"
                onClick={() => setSelectedImage(user.governmentIdUrl!)}
              />
            </div>
          ) : (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg flex items-center justify-center">
              <Image className="h-6 w-6 text-gray-400 mr-2" />
              <span className="text-gray-500">No ID image uploaded</span>
            </div>
          )}
        </div>
      ))}

      {/* Image Preview Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-4xl w-full mx-4">
            <img
              src={selectedImage}
              alt="ID Preview"
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Debug Panel */}
      <DebugPanel
        request={debugInfo?.request}
        response={debugInfo?.response}
      />
    </div>
  );
}