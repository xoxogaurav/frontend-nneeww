import React, { useState, useEffect } from 'react';
import { Wallet, TrendingUp, ArrowUpRight } from 'lucide-react';
import { TransactionService } from '../services';

interface WalletCardProps {
  balance: string | number;
}

export default function WalletCard({ balance }: WalletCardProps) {
  const [monthlyEarnings, setMonthlyEarnings] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Convert string balance to number and handle potential undefined/null values
  const numericBalance = typeof balance === 'string' ? parseFloat(balance) : (typeof balance === 'number' ? balance : 0);

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

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl text-white p-6 shadow-lg">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-lg font-medium opacity-90">Available Balance</h2>
          <p className="text-3xl font-bold mt-1">${numericBalance.toFixed(2)}</p>
        </div>
        <Wallet className="h-8 w-8 opacity-80" />
      </div>
      
      <div className="flex justify-between items-center mt-6">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5" />
          <span className="text-sm opacity-90">This month</span>
        </div>
        <div className="flex items-center space-x-1">
          {isLoading ? (
            <div className="animate-pulse bg-white bg-opacity-20 h-6 w-24 rounded"></div>
          ) : (
            <>
              <span className="text-lg font-semibold">+${monthlyEarnings.toFixed(2)}</span>
              <ArrowUpRight className="h-4 w-4" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}