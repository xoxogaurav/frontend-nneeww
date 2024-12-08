import React, { useState, useEffect } from 'react';
import TaskList from './TaskList';
import WalletCard from './WalletCard';
import Leaderboard from './Leaderboard';
import QuickStats from './QuickStats';
import { Task } from '../db/database';
import { UserService, TransactionService } from '../services';
import toast from 'react-hot-toast';

interface DashboardProps {
  onTaskSelect: (task: Task) => void;
  searchQuery: string;
}

export default function Dashboard({ onTaskSelect, searchQuery }: DashboardProps) {
  const [profile, setProfile] = useState<any>(null);
  const [pendingTasks, setPendingTasks] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileData, transactionsData] = await Promise.all([
          UserService.getProfile(),
          TransactionService.getTransactions()
        ]);

        // Count pending tasks from transactions
        const pendingCount = transactionsData.filter(tx => 
          tx.type === 'earning' && tx.status === 'pending'
        ).length;

        setProfile(profileData);
        setPendingTasks(pendingCount);
      } catch (error) {
        console.error('Error fetching profile data:', error);
        toast.error('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Available Tasks</h1>
              <p className="mt-1 text-gray-500">Find and complete tasks to earn rewards</p>
            </div>

            {/* Task List */}
            <TaskList onTaskSelect={onTaskSelect} searchQuery={searchQuery} />
          </div>

          {/* Sidebar */}
          <div className="w-full md:w-80 space-y-6">
            <WalletCard balance={profile?.balance || 0} />
            
            {/* Quick Stats */}
            <QuickStats
              tasksCompleted={profile?.tasksCompleted || 0}
              successRate={profile?.successRate || 0}
              averageRating={profile?.averageRating || 0}
              pendingTasks={pendingTasks}
            />
            
            {/* Leaderboard */}
            <Leaderboard />
          </div>
        </div>
      </main>
    </div>
  );
}