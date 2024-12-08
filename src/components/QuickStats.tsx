import React from 'react';
import { CheckCircle, TrendingUp, Star } from 'lucide-react';

interface QuickStatsProps {
  tasksCompleted: number;
  successRate: string | number;
  averageRating: string | number;
  pendingTasks?: number;
}

export default function QuickStats({ tasksCompleted, successRate, averageRating, pendingTasks = 0 }: QuickStatsProps) {
  // Calculate total tasks (completed + pending)
  const totalTasks = tasksCompleted + pendingTasks;

  // Calculate success rate based on completed tasks vs total tasks
  const calculatedSuccessRate = totalTasks > 0 
    ? (tasksCompleted / totalTasks) * 100 
    : 0;

  // Use calculated rate
  const finalSuccessRate = calculatedSuccessRate;

  const numericAverageRating = typeof averageRating === 'string' 
    ? parseFloat(averageRating) 
    : typeof averageRating === 'number' 
      ? averageRating 
      : 0;

  // Ensure values are valid numbers and not negative
  const validSuccessRate = !isNaN(finalSuccessRate) ? Math.max(0, finalSuccessRate) : 0;
  const validAverageRating = !isNaN(numericAverageRating) ? Math.max(0, numericAverageRating) : 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
      <div className="space-y-6">
        <div className="flex items-center">
          <div className="p-2 rounded-full bg-green-100 text-green-600">
            <CheckCircle className="h-5 w-5" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-gray-500">Tasks Completed</p>
            <p className="text-xl font-semibold text-gray-900">{tasksCompleted || 0}</p>
            {pendingTasks > 0 && (
              <p className="text-xs text-gray-500">
                +{pendingTasks} pending approval
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center">
          <div className="p-2 rounded-full bg-indigo-100 text-indigo-600">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-gray-500">Success Rate</p>
            <p className="text-xl font-semibold text-gray-900">
              {validSuccessRate.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500">
              {tasksCompleted} of {totalTasks} tasks completed
            </p>
          </div>
        </div>

        
      </div>
    </div>
  );
}