import React from 'react';
import { CheckCircle, XCircle, Clock, ExternalLink } from 'lucide-react';
import { TaskSubmission } from '../../db/database';
import { AdminService } from '../../services';
import toast from 'react-hot-toast';

interface TaskSubmissionListProps {
  submissions: TaskSubmission[];
  onSubmissionUpdate: () => void;
}

export default function TaskSubmissionList({ submissions, onSubmissionUpdate }: TaskSubmissionListProps) {
  const handleApprove = async (taskId: number, submissionId: number) => {
    try {
      const result = await AdminService.reviewSubmission(taskId, submissionId, 'approved');
      console.log('Approval result:', result);
      
      if (result.submission && result.transaction) {
        toast.success('Task submission approved and reward processed');
      } else {
        toast.success('Task submission approved');
      }
      
      onSubmissionUpdate();
    } catch (error) {
      console.error('Error approving submission:', error);
      toast.error('Failed to approve submission');
    }
  };

  const handleReject = async (taskId: number, submissionId: number) => {
    try {
      const result = await AdminService.reviewSubmission(taskId, submissionId, 'rejected');
      console.log('Rejection result:', result);
      
      if (result.submission && result.transaction) {
        toast.success('Task submission rejected and transaction updated');
      } else {
        toast.success('Task submission rejected');
      }
      
      onSubmissionUpdate();
    } catch (error) {
      console.error('Error rejecting submission:', error);
      toast.error('Failed to reject submission');
    }
  };

  if (!submissions?.length) {
    return (
      <div className="text-center py-8 text-gray-500">
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
                <h3 className="text-lg font-semibold text-gray-900">
                  {submission.task?.title || 'Task Submission'}
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  submission.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  submission.status === 'approved' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Submitted by: {submission.user?.name || 'Unknown User'}
              </p>
              <p className="text-sm text-gray-500">
                Submitted at: {new Date(submission.submittedAt).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {submission.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleApprove(submission.taskId, submission.id!)}
                    className="flex items-center px-3 py-1 text-sm font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(submission.taskId, submission.id!)}
                    className="flex items-center px-3 py-1 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>
          
          {submission.screenshotUrl && (
            <div className="mt-4">
              <a
                href={submission.screenshotUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-sm text-indigo-600 hover:text-indigo-500"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                View Screenshot
              </a>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}