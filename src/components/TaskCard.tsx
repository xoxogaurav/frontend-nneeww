import React, { useCallback } from 'react';
import { Clock, DollarSign, Tag, Zap, UserCheck, AlertCircle } from 'lucide-react';
import { useTaskCooldown } from '../hooks/useTaskCooldown';
import toast from 'react-hot-toast';

interface TaskCardProps {
  id: number;
  title: string;
  description: string;
  reward: string | number;
  timeEstimate: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  approval_type?: string;
  approvalType?: 'automatic' | 'manual';
  hourly_limit?: number;
  daily_limit?: number;
  onClick: () => void;
}

export default function TaskCard({
  id,
  title,
  description,
  reward,
  timeEstimate,
  category,
  difficulty,
  approval_type,
  approvalType,
  hourly_limit = 0,
  daily_limit = 0,
  onClick
}: TaskCardProps) {
  const {
    isOnCooldown,
    cooldownTimeLeft,
    hourlyCompletions,
    dailyCompletions,
    canComplete,
    limitMessage
  } = useTaskCooldown(id, hourly_limit, daily_limit);

  const difficultyColor = {
    Easy: 'bg-green-100 text-green-800',
    Medium: 'bg-yellow-100 text-yellow-800',
    Hard: 'bg-red-100 text-red-800'
  }[difficulty];

  // Normalize approval type from API response
  const normalizedApprovalType = approval_type || approvalType;

  // Convert reward to number if it's a string
  const numericReward = typeof reward === 'string' ? parseFloat(reward) : reward;

  const handleClick = useCallback(() => {
    if (!canComplete) {
      toast.error(limitMessage || 'Cannot complete this task right now', {
        duration: 3000,
        icon: '⏳'
      });
      return;
    }
    onClick();
  }, [canComplete, limitMessage, onClick]);

  return (
    <div 
      onClick={handleClick}
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-all duration-200 ${
        !canComplete 
          ? 'opacity-75 cursor-not-allowed bg-gray-50' 
          : 'hover:shadow-md cursor-pointer hover:border-indigo-200'
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <span className="flex items-center text-lg font-bold text-indigo-600">
          <DollarSign className="h-5 w-5 mr-1" />
          {numericReward.toFixed(2)}
        </span>
      </div>
      
      <p className="text-gray-600 mb-4 line-clamp-2">{description}</p>
      
      <div className="flex flex-wrap gap-2 items-center">
        <span className="flex items-center text-sm text-gray-500">
          <Clock className="h-4 w-4 mr-1" />
          {timeEstimate}
        </span>
        <span className="flex items-center text-sm text-gray-500">
          <Tag className="h-4 w-4 mr-1" />
          {category}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyColor}`}>
          {difficulty}
        </span>
        <span className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          normalizedApprovalType === 'automatic' 
            ? 'bg-blue-100 text-blue-800' 
            : 'bg-purple-100 text-purple-800'
        }`}>
          {normalizedApprovalType === 'automatic' ? (
            <><Zap className="h-3 w-3 mr-1" /> Instant</>
          ) : (
            <><UserCheck className="h-3 w-3 mr-1" /> Manual</>
          )}
        </span>
      </div>

      {(!canComplete || hourly_limit > 0 || daily_limit > 0) && (
        <div className="mt-4 space-y-2">
          {!canComplete && (
            <div className="flex items-center text-sm text-red-600">
              <AlertCircle className="h-4 w-4 mr-1" />
              {isOnCooldown ? `Cooldown: ${cooldownTimeLeft}` : 'Limit Reached'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}