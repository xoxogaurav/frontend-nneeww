import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, ExternalLink, Image } from 'lucide-react';
import AdvertiserService from '../../services/advertiser';
import type { PendingSubmission } from '../../services/advertiser';
import toast from 'react-hot-toast';

export default function PendingSubmissions() {
  const [submissions, setSubmissions] = useState<PendingSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<number | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const data = await AdvertiserService.getPendingSubmissions();
      setSubmissions(data);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast.error('Failed to load pending submissions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReview = async (submissionId: number, status: 'approved' | 'rejected') => {
    if (isProcessing) return;
    
    setIsProcessing(submissionId);
    
    try {
      await AdvertiserService.reviewSubmission(submissionId, status);
      toast.success(`Submission ${status}`);
      fetchSubmissions();
    } catch (error) {
      console.error('Review error:', error);
      toast.error(`Failed to ${status} submission`);
    } finally {
      setIsProcessing(null);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!submissions.length) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-500">
        No pending submissions
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {submissions.map((submission) => (
        <div key={submission.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{submission.task.title}</h3>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Pending Review
                </span>
              </div>
              <p className="text-sm text-gray-600">Submitted by: {submission.user.name}</p>
              <p className="text-sm text-gray-500">
                Submitted at: {new Date(submission.created_at).toLocaleString()}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleReview(submission.id, 'approved')}
                disabled={isProcessing === submission.id}
                className="flex items-center px-3 py-1 text-sm font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Approve
              </button>
              <button
                onClick={() => handleReview(submission.id, 'rejected')}
                disabled={isProcessing === submission.id}
                className="flex items-center px-3 py-1 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200"
              >
                <XCircle className="h-4 w-4 mr-1" />
                Reject
              </button>
            </div>
          </div>
          
          {submission.screenshot_url && (
            <div className="mt-4">
              <img
                src={submission.screenshot_url}
                alt="Submission screenshot"
                className="w-full h-48 object-cover rounded-lg cursor-pointer"
                onClick={() => setSelectedImage(submission.screenshot_url)}
              />
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
              alt="Screenshot preview"
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}