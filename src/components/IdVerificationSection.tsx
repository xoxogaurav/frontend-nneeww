import React, { useState } from 'react';
import { Upload, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { UploadService } from '../services';
import toast from 'react-hot-toast';

interface IdVerificationProps {
  currentStatus: 'none' | 'pending' | 'approved' | 'rejected';
  currentIdUrl?: string;
  onIdSubmit: (idUrl: string) => Promise<void>;
}

export default function IdVerificationSection({ 
  currentStatus, 
  currentIdUrl,
  onIdSubmit 
}: IdVerificationProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Upload image using the same service as task screenshots
      const uploadedUrl = await UploadService.uploadImage(selectedFile);
      setUploadProgress(50);

      // Submit the uploaded URL to the server
      await onIdSubmit(uploadedUrl);
      setUploadProgress(100);

      toast.success('ID proof submitted successfully');
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (error) {
      console.error('Error uploading ID:', error);
      toast.error('Failed to upload ID proof');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const getStatusBadge = () => {
    switch (currentStatus) {
      case 'pending':
        return (
          <div className="flex items-center text-yellow-600">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>Verification Pending</span>
          </div>
        );
      case 'approved':
        return (
          <div className="flex items-center text-green-600">
            <CheckCircle className="h-5 w-5 mr-2" />
            <span>Verified</span>
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center text-red-600">
            <XCircle className="h-5 w-5 mr-2" />
            <span>Verification Rejected</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Government ID Verification</h3>
          <p className="mt-1 text-sm text-gray-500">
            Upload a valid government ID to verify your address and identity
          </p>
        </div>
        {getStatusBadge()}
      </div>

      {currentStatus !== 'approved' && (
        <>
          {currentStatus === 'pending' ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-700">
                Your ID is currently under review. We'll notify you once the verification is complete.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">Upload government ID</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </label>
              </div>

              {previewUrl && (
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="ID preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                    }}
                    className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                </div>
              )}

              {uploadProgress > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}

              {selectedFile && (
                <button
                  onClick={handleSubmit}
                  disabled={isUploading}
                  className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
                >
                  {isUploading ? 'Uploading...' : 'Submit for Verification'}
                </button>
              )}

              {currentStatus === 'rejected' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-700">
                    Your previous ID verification was rejected. Please submit a new, valid government ID.
                  </p>
                </div>
              )}
            </>
          )}
        </>
      )}

      {currentStatus === 'approved' && currentIdUrl && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-700">
            Your identity has been verified successfully.
          </p>
          <img
            src={currentIdUrl}
            alt="Verified ID"
            className="mt-2 w-full h-32 object-cover rounded-lg"
          />
        </div>
      )}
    </div>
  );
}