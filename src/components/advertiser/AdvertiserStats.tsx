import React from 'react';
import { Wallet, TrendingUp } from 'lucide-react';
import type { AdvertiserBalance } from '../../services/advertiser';

interface AdvertiserStatsProps {
  balance: AdvertiserBalance;
}

export default function AdvertiserStats({ balance }: AdvertiserStatsProps) {
  // Convert balance values to numbers if they're strings
  const numericBalance = typeof balance.balance === 'string' ? parseFloat(balance.balance) : balance.balance;
  const numericTotalSpent = typeof balance.total_spent === 'string' ? parseFloat(balance.total_spent) : balance.total_spent;

  return (
    <div className="grid gap-6 md:grid-cols-3 mb-8">
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Available Balance</p>
            <p className="text-2xl font-bold text-gray-900">
              ${numericBalance.toFixed(2)}
            </p>
          </div>
          <div className="p-3 bg-green-100 rounded-full">
            <Wallet className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Total Spent</p>
            <p className="text-2xl font-bold text-gray-900">
              ${numericTotalSpent.toFixed(2)}
            </p>
          </div>
          <div className="p-3 bg-blue-100 rounded-full">
            <TrendingUp className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">ROI</p>
            <p className="text-2xl font-bold text-gray-900">
              {numericTotalSpent > 0 
                ? `${((numericBalance / numericTotalSpent) * 100).toFixed(1)}%`
                : 'N/A'}
            </p>
          </div>
          <div className="p-3 bg-purple-100 rounded-full">
            <TrendingUp className="h-6 w-6 text-purple-600" />
          </div>
        </div>
      </div>
    </div>
  );
}