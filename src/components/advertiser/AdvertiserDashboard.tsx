import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, History, Clock, DollarSign } from 'lucide-react';
import AdvertiserService from '../../services/advertiser';
import type { AdvertiserTask } from '../../services/advertiser';
import NewAdvertiserTaskModal from './NewAdvertiserTaskModal';
import AdvertiserTaskList from './AdvertiserTaskList';
import AdvertiserStats from './AdvertiserStats';
import AdvertiserHeader from './AdvertiserHeader';
import TransactionHistory from './TransactionHistory';
import PendingSubmissions from './PendingSubmissions';
import AddBalanceModal from './AddBalanceModal';
import toast from 'react-hot-toast';

export default function AdvertiserDashboard() {
  const { user, logout } = useAuth();
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isAddBalanceModalOpen, setIsAddBalanceModalOpen] = useState(false);
  const [tasks, setTasks] = useState<AdvertiserTask[]>([]);
  const [balance, setBalance] = useState({ balance: 0, total_spent: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'campaigns' | 'transactions' | 'submissions'>('campaigns');

  const fetchData = async () => {
    try {
      const [tasksData, balanceData] = await Promise.all([
        AdvertiserService.getTasks(),
        AdvertiserService.getBalance()
      ]);
      
      setTasks(tasksData);
      setBalance(balanceData);
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

  const handleTaskCreated = (newTask: AdvertiserTask) => {
    setTasks(prev => [...prev, newTask]);
    setIsNewTaskModalOpen(false);
    toast.success('Campaign created successfully');
  };

  if (!user?.is_advertiser) {
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
    <div className="min-h-screen bg-gray-50">
      <AdvertiserHeader onLogout={handleLogout} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Campaign Manager</h1>
            <p className="mt-1 text-gray-500">Create and manage your advertising campaigns</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setIsAddBalanceModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <DollarSign className="h-5 w-5 mr-2" />
              Add Balance
            </button>
            <button
              onClick={() => setIsNewTaskModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Campaign
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <AdvertiserStats balance={balance} />

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`px-4 py-2 text-sm font-medium -mb-px ${
              activeTab === 'campaigns'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Campaigns
          </button>
          <button
            onClick={() => setActiveTab('submissions')}
            className={`px-4 py-2 text-sm font-medium -mb-px flex items-center ${
              activeTab === 'submissions'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Clock className="h-4 w-4 mr-1" />
            Pending Submissions
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-4 py-2 text-sm font-medium -mb-px flex items-center ${
              activeTab === 'transactions'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <History className="h-4 w-4 mr-1" />
            Transaction History
          </button>
        </div>

        {/* Content */}
        {activeTab === 'campaigns' && (
          <AdvertiserTaskList tasks={tasks} onTaskUpdate={fetchData} />
        )}
        {activeTab === 'submissions' && (
          <PendingSubmissions />
        )}
        {activeTab === 'transactions' && (
          <TransactionHistory />
        )}
      </div>

      {/* Modals */}
      {isNewTaskModalOpen && (
        <NewAdvertiserTaskModal 
          onClose={() => setIsNewTaskModalOpen(false)} 
          onTaskCreated={handleTaskCreated}
        />
      )}
      {isAddBalanceModalOpen && (
        <AddBalanceModal
          onClose={() => setIsAddBalanceModalOpen(false)}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
}