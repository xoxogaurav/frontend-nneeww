import React from 'react';
import { Users, DollarSign, CheckCircle, Clock } from 'lucide-react';

interface StatsCardProps {
  totalUsers: number;
  totalEarnings: number | string;
  completedTasks: number;
  pendingSubmissions: number;
}

export default function StatsCard({ totalUsers, totalEarnings, completedTasks, pendingSubmissions }: StatsCardProps) {
  // Convert totalEarnings to number if it's a string
  const numericEarnings = typeof totalEarnings === 'string' ? parseFloat(totalEarnings) : totalEarnings;

  const stats = [
    {
      name: 'Total Users',
      value: totalUsers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      format: (value: number) => value.toString()
    },
    {
      name: 'Total Earnings',
      value: numericEarnings,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      format: (value: number) => `$${value.toFixed(2)}`
    },
    {
      name: 'Completed Tasks',
      value: completedTasks,
      icon: CheckCircle,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      format: (value: number) => value.toString()
    },
    {
      name: 'Pending Submissions',
      value: pendingSubmissions,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      format: (value: number) => value.toString()
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.name} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stat.format(stat.value)}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}