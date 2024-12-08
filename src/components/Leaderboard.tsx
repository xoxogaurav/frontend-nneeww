import React, { useState, useEffect } from 'react';
import { UserService } from '../services';
import { Trophy, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

interface LeaderboardEntry {
  id?: number;
  name: string;
  balance: string | number;
  tasksCompleted: number;
  profilePicture?: string;
}

export default function Leaderboard() {
  const [topUsers, setTopUsers] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await UserService.getLeaderboard();
        setTopUsers(data.map(user => ({
          ...user,
          profilePicture: user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`
        })));
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        toast.error('Failed to load leaderboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="rounded-full bg-gray-200 h-10 w-10"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!topUsers || topUsers.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
          Top Earners
        </h2>
        <TrendingUp className="h-5 w-5 text-indigo-500" />
      </div>

      <div className="space-y-4">
        {topUsers.map((user, index) => {
          // Convert balance to number if it's a string
          const numericBalance = typeof user.balance === 'string' 
            ? parseFloat(user.balance) 
            : user.balance;

          return (
            <div key={user.id || index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className={`absolute -top-1 -left-1 ${
                    index === 0 ? 'bg-yellow-400' :
                    index === 1 ? 'bg-gray-300' :
                    index === 2 ? 'bg-amber-600' : 'hidden'
                  } w-5 h-5 rounded-full flex items-center justify-center text-xs text-white font-bold`}>
                    {index + 1}
                  </div>
                  <img
                    src={user.profilePicture}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.tasksCompleted} tasks</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-indigo-600">${numericBalance.toFixed(2)}</p>
                <p className="text-xs text-gray-500">earned</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Complete more tasks to climb the leaderboard!
        </p>
      </div>
    </div>
  );
}