import React, { useState } from 'react';
import { Clock, DollarSign, Edit, TrendingUp, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import type { AdvertiserTask } from '../../services/advertiser';
import EditAdvertiserTaskModal from './EditAdvertiserTaskModal';
import TaskStats from './TaskStats';
import toast from 'react-hot-toast';

interface AdvertiserTaskListProps {
  tasks: AdvertiserTask[];
  onTaskUpdate: () => void;
}

export default function AdvertiserTaskList({ tasks, onTaskUpdate }: AdvertiserTaskListProps) {
  const [editingTask, setEditingTask] = useState<AdvertiserTask | null>(null);
  const [expandedTaskId, setExpandedTaskId] = useState<number | null>(null);

  const handleTaskUpdated = () => {
    setEditingTask(null);
    onTaskUpdate();
  };

  const toggleTaskExpansion = (taskId: number) => {
    setExpandedTaskId(expandedTaskId === taskId ? null : taskId);
  };

  const getAdminStatusBadge = (status: string | undefined) => {
    switch (status) {
      case 'approved':
        return (
          <span className="flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </span>
        );
      case 'pending':
        return (
          <span className="flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Pending Review
          </span>
        );
      default:
        return null;
    }
  };

  if (!tasks?.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        No tasks available
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {tasks.map((task) => {
          const numericReward = typeof task.reward === 'string' ? parseFloat(task.reward) : task.reward;
          const numericTotalBudget = typeof task.total_budget === 'string' ? parseFloat(task.total_budget) : task.total_budget;
          const numericRemainingBudget = typeof task.remaining_budget === 'string' ? parseFloat(task.remaining_budget) : task.remaining_budget;
          const isExpanded = expandedTaskId === task.id;

          return (
            <div key={task.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                      {getAdminStatusBadge(task.admin_status)}
                    </div>
                    <p className="text-gray-600">{task.description}</p>
                  </div>
                  <span className="flex items-center text-lg font-bold text-indigo-600">
                    <DollarSign className="h-5 w-5 mr-1" />
                    {numericReward.toFixed(2)}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-2 items-center mb-4">
                  <span className="flex items-center text-sm text-gray-500">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    Budget: ${numericTotalBudget.toFixed(2)}
                  </span>
                  <span className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    Remaining: ${numericRemainingBudget.toFixed(2)}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    task.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {task.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {task.admin_feedback && (
                  <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <div className="flex">
                      <AlertTriangle className="h-5 w-5 text-yellow-400" />
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">Admin Feedback</h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <p>{task.admin_feedback}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <button
                    onClick={() => toggleTaskExpansion(task.id)}
                    className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="h-4 w-4 mr-1" />
                        Hide Statistics
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-1" />
                        View Statistics
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setEditingTask(task)}
                    className="flex items-center px-3 py-1 text-sm text-indigo-600 hover:text-indigo-700"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </button>
                </div>
              </div>

              {/* Task Stats */}
              {isExpanded && (
                <div className="border-t border-gray-200 p-6">
                  <TaskStats taskId={task.id} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {editingTask && (
        <EditAdvertiserTaskModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onTaskUpdated={handleTaskUpdated}
        />
      )}
    </>
  );
}