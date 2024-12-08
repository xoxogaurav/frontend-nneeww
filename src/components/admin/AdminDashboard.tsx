import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, Users, FileCheck, Wallet, Bell, ClipboardCheck } from 'lucide-react';
import { AdminService } from '../../services';
import { Task, TaskSubmission, User } from '../../db/database';
import { PendingWithdrawal } from '../../services/admin';
import TaskSubmissionList from './TaskSubmissionList';
import TaskReviewList from './TaskReviewList';
import IdVerificationList from './IdVerificationList';
import WithdrawalList from './WithdrawalList';
import NotificationSender from './NotificationSender';
import StatsCard from './StatsCard';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [pendingTasks, setPendingTasks] = useState<Task[]>([]);
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
  const [verifications, setVerifications] = useState<User[]>([]);
  const [withdrawals, setWithdrawals] = useState<PendingWithdrawal[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEarnings: 0,
    completedTasks: 0,
    pendingSubmissions: 0
  });
  const [activeTab, setActiveTab] = useState<'pending_tasks' | 'submissions' | 'verifications' | 'withdrawals' | 'notifications'>('pending_tasks');
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [pendingTasksData, submissionsData, verificationsData, withdrawalsData, statsData] = await Promise.all([
        AdminService.getPendingTasks(),
        AdminService.getPendingSubmissions(),
        AdminService.getPendingIdVerifications(),
        AdminService.getPendingWithdrawals(),
        AdminService.getDashboardStats()
      ]);
      
      setPendingTasks(pendingTasksData);
      setSubmissions(submissionsData);
      setVerifications(verificationsData);
      setWithdrawals(withdrawalsData);
      setStats({
        totalUsers: statsData.users,
        totalEarnings: statsData.totalEarnings,
        completedTasks: statsData.tasks,
        pendingSubmissions: statsData.pendingSubmissions
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  if (!user?.is_admin) {
    return <div>Access denied</div>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="mt-1 text-gray-500">Manage platform activity</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Logout
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <StatsCard
          totalUsers={stats.totalUsers}
          totalEarnings={stats.totalEarnings}
          completedTasks={stats.completedTasks}
          pendingSubmissions={stats.pendingSubmissions}
        />

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('pending_tasks')}
            className={`px-4 py-2 text-sm font-medium -mb-px ${
              activeTab === 'pending_tasks'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <ClipboardCheck className="h-4 w-4 inline-block mr-1" />
            Task Review
          </button>
          <button
            onClick={() => setActiveTab('submissions')}
            className={`px-4 py-2 text-sm font-medium -mb-px ${
              activeTab === 'submissions'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileCheck className="h-4 w-4 inline-block mr-1" />
            Submissions
          </button>
          <button
            onClick={() => setActiveTab('verifications')}
            className={`px-4 py-2 text-sm font-medium -mb-px ${
              activeTab === 'verifications'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users className="h-4 w-4 inline-block mr-1" />
            ID Verifications
          </button>
          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`px-4 py-2 text-sm font-medium -mb-px ${
              activeTab === 'withdrawals'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Wallet className="h-4 w-4 inline-block mr-1" />
            Withdrawals
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-4 py-2 text-sm font-medium -mb-px ${
              activeTab === 'notifications'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Bell className="h-4 w-4 inline-block mr-1" />
            Notifications
          </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {activeTab === 'pending_tasks' && (
            <>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Task Review</h2>
              <TaskReviewList 
                tasks={pendingTasks} 
                onTaskUpdate={fetchData}
              />
            </>
          )}
          
          {activeTab === 'submissions' && (
            <>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Pending Submissions</h2>
              <TaskSubmissionList 
                submissions={submissions} 
                onSubmissionUpdate={fetchData}
              />
            </>
          )}

          {activeTab === 'verifications' && (
            <>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">ID Verifications</h2>
              <IdVerificationList
                verifications={verifications}
                onVerificationUpdate={fetchData}
              />
            </>
          )}

          {activeTab === 'withdrawals' && (
            <>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Pending Withdrawals</h2>
              <WithdrawalList
                withdrawals={withdrawals}
                onWithdrawalUpdate={fetchData}
              />
            </>
          )}

          {activeTab === 'notifications' && (
            <NotificationSender />
          )}
        </div>
      </div>
    </div>
  );
}