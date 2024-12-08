import React, { useState, useEffect } from 'react';
import { BarChart3, CheckCircle, Clock, XCircle, DollarSign } from 'lucide-react';
import AdvertiserService from '../../services/advertiser';
import toast from 'react-hot-toast';

interface TaskStatsProps {
  taskId: number;
}

interface DailyStats {
  date: string;
  total: number;
  status: string;
}

interface TaskStats {
  total_submissions: number;
  approved_submissions: number;
  pending_submissions: number;
  rejected_submissions: number;
  remaining_budget: string | number;
  spent_budget: string | number;
  daily_stats: {
    [key: string]: DailyStats[];
  };
}

export default function TaskStats({ taskId }: TaskStatsProps) {
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await AdvertiserService.getTaskStats(taskId);
        setStats(data);
      } catch (error) {
        console.error('Error fetching task stats:', error);
        toast.error('Failed to load task statistics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [taskId]);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-24 bg-gray-200 rounded"></div>
        <div className="h-48 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-4 text-gray-500">
        Failed to load statistics
      </div>
    );
  }

  // Convert string values to numbers
  const remainingBudget = typeof stats.remaining_budget === 'string' 
    ? parseFloat(stats.remaining_budget) 
    : stats.remaining_budget;

  const spentBudget = typeof stats.spent_budget === 'string'
    ? parseFloat(stats.spent_budget)
    : stats.spent_budget;

  // Process daily stats
  const dailyStatsEntries = Object.entries(stats.daily_stats || {});

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Total Submissions</h3>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          <p className="text-2xl font-semibold text-gray-900">{stats.total_submissions}</p>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Approved</h3>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-2xl font-semibold text-green-600">{stats.approved_submissions}</p>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Pending</h3>
            <Clock className="h-5 w-5 text-yellow-500" />
          </div>
          <p className="text-2xl font-semibold text-yellow-600">{stats.pending_submissions}</p>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Rejected</h3>
            <XCircle className="h-5 w-5 text-red-500" />
          </div>
          <p className="text-2xl font-semibold text-red-600">{stats.rejected_submissions}</p>
        </div>
      </div>

      {/* Budget Stats */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Budget Overview</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Remaining Budget</span>
              <DollarSign className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-2xl font-semibold text-green-600">
              ${remainingBudget.toFixed(2)}
            </p>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Spent Budget</span>
              <DollarSign className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-2xl font-semibold text-blue-600">
              ${spentBudget.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-600 rounded-full"
              style={{ 
                width: `${(spentBudget / (spentBudget + remainingBudget)) * 100}%` 
              }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>0%</span>
            <span>
              {((spentBudget / (spentBudget + remainingBudget)) * 100).toFixed(1)}% spent
            </span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Daily Stats */}
      {dailyStatsEntries.length > 0 && (
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Performance</h3>
          <div className="space-y-4">
            {dailyStatsEntries.map(([date, stats]) => {
              const approvedStats = stats.find(s => s.status === 'approved');
              const pendingStats = stats.find(s => s.status === 'pending');
              const rejectedStats = stats.find(s => s.status === 'rejected');
              const totalSubmissions = stats.reduce((sum, s) => sum + s.total, 0);

              return (
                <div key={date} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(date).toLocaleDateString()}
                    </span>
                    <span className="text-sm text-gray-500">
                      {totalSubmissions} submissions
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm text-gray-600">
                        {approvedStats?.total || 0} approved
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-yellow-500 mr-2" />
                      <span className="text-sm text-gray-600">
                        {pendingStats?.total || 0} pending
                      </span>
                    </div>
                    <div className="flex items-center">
                      <XCircle className="h-4 w-4 text-red-500 mr-2" />
                      <span className="text-sm text-gray-600">
                        {rejectedStats?.total || 0} rejected
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}