import React, { useState } from 'react';
import { CheckCircle, XCircle, DollarSign, Clock, User, AlertTriangle } from 'lucide-react';
import { AdminService } from '../../services';
import toast from 'react-hot-toast';
import DebugPanel from '../DebugPanel';

interface PendingTask {
  id: number;
  title: string;
  description: string;
  reward: string | number;
  time_estimate: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  steps: string[];
  approval_type: 'automatic' | 'manual';
  admin_status: 'pending' | 'approved' | 'rejected';
  admin_feedback?: string;
  advertiser: {
    id: number;
    name: string;
    email: string;
  };
  total_budget: string | number;
  remaining_budget: string | number;
}

interface TaskReviewListProps {
  tasks: PendingTask[];
  onTaskUpdate: () => void;
}

export default function TaskReviewList({ tasks, onTaskUpdate }: TaskReviewListProps) {
  const [isProcessing, setIsProcessing] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const handleReview = async (taskId: number, status: 'approved' | 'rejected') => {
    if (!feedback.trim()) {
      toast.error('Please provide feedback before submitting review');
      return;
    }

    setIsProcessing(taskId);

    try {
      // Update debug info with request details
      setDebugInfo({
        request: {
          method: 'PUT',
          url: `/admin/tasks/${taskId}/review`,
          data: { status, feedback }
        }
      });

      await AdminService.reviewTask(taskId, status, feedback);

      // Update debug info with response
      setDebugInfo(prev => ({
        ...prev,
        response: {
          status: 200,
          data: { success: true }
        }
      }));

      toast.success(`Task ${status} successfully`);
      onTaskUpdate();
      setFeedback('');
    } catch (error: any) {
      console.error('Review error:', error);
      
      // Update debug info with error
      setDebugInfo(prev => ({
        ...prev,
        response: {
          status: error.response?.status || 500,
          error: error.message,
          data: error.response?.data
        }
      }));

      toast.error(`Failed to ${status} task`);
    } finally {
      setIsProcessing(null);
    }
  };

  if (!tasks?.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        No pending tasks to review
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {tasks.map((task) => {
        const numericReward = typeof task.reward === 'string' ? parseFloat(task.reward) : task.reward;
        const numericTotalBudget = typeof task.total_budget === 'string' ? parseFloat(task.total_budget) : task.total_budget;

        return (
          <div key={task.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                <p className="text-gray-600 mt-1">{task.description}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center text-lg font-bold text-indigo-600">
                  <DollarSign className="h-5 w-5 mr-1" />
                  {numericReward.toFixed(2)}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Budget: ${numericTotalBudget.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-1" />
                {task.time_estimate}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <User className="h-4 w-4 mr-1" />
                {task.advertiser.name}
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <h4 className="text-sm font-medium text-gray-700">Task Steps:</h4>
              <ol className="list-decimal list-inside space-y-1">
                {task.steps.map((step, index) => (
                  <li key={index} className="text-sm text-gray-600">{step}</li>
                ))}
              </ol>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Review Feedback
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                  rows={3}
                  placeholder="Provide detailed feedback about the task..."
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => handleReview(task.id, 'rejected')}
                  disabled={isProcessing === task.id}
                  className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-400"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Task
                </button>
                <button
                  onClick={() => handleReview(task.id, 'approved')}
                  disabled={isProcessing === task.id}
                  className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-400"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve Task
                </button>
              </div>
            </div>

            {task.admin_feedback && (
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">Previous Feedback</h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>{task.admin_feedback}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <DebugPanel
        request={debugInfo?.request}
        response={debugInfo?.response}
      />
    </div>
  );
}