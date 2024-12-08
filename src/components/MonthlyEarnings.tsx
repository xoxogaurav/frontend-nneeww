import React, { useState, useEffect } from 'react';
import { TrendingUp, ArrowUpRight } from 'lucide-react';
import { TransactionService } from '../services';

export default function MonthlyEarnings() {
  const [monthlyEarnings, setMonthlyEarnings] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMonthlyEarnings = async () => {
      try {
        const transactions = await TransactionService.getTransactions();
        
        // Filter transactions for current month and sum completed earnings
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const monthlyTotal = transactions
          .filter(tx => {
            const txDate = new Date(tx.created_at || tx.createdAt || '');
            return (
              tx.type === 'earning' &&
              tx.status === 'completed' &&
              txDate >= firstDayOfMonth
            );
          })
          .reduce((sum, tx) => {
            const amount = typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount;
            return sum + amount;
          }, 0);

        setMonthlyEarnings(monthlyTotal);
      } catch (error) {
        console.error('Error fetching monthly earnings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMonthlyEarnings();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-medium text-gray-600">This Month</h2>
        <TrendingUp className="h-5 w-5 text-gray-400" />
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-2xl font-bold text-gray-900">
          ${monthlyEarnings.toFixed(2)}
        </span>
        <ArrowUpRight className="h-5 w-5 text-green-500" />
      </div>
    </div>
  );
}