import React, { useState, useEffect } from 'react';
import { DollarSign, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import AdvertiserService from '../../services/advertiser';
import toast from 'react-hot-toast';

interface Transaction {
  id: number;
  user_id: number;
  task_id: number | null;
  amount: string | number;
  type: 'task_payment' | 'advertiser_deposit';
  status: 'completed' | 'pending' | 'failed';
  created_at: string;
  updated_at: string;
}

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await AdvertiserService.getTransactions();
        setTransactions(data);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        toast.error('Failed to load transaction history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const getTransactionStyles = (type: string, status: string) => {
    if (type === 'advertiser_deposit') {
      return {
        icon: <ArrowUpRight className="h-5 w-5 text-green-600" />,
        bg: 'bg-green-100',
        text: status === 'completed' ? 'text-gray-900' : 'text-gray-600',
        prefix: '+'
      };
    }

    // For task payments
    switch (status) {
      case 'completed':
        return {
          icon: <ArrowDownRight className="h-5 w-5 text-blue-600" />,
          bg: 'bg-blue-100',
          text: 'text-gray-900',
          prefix: ''
        };
      case 'pending':
        return {
          icon: <Clock className="h-5 w-5 text-yellow-600" />,
          bg: 'bg-yellow-100',
          text: 'text-gray-600',
          prefix: ''
        };
      case 'failed':
        return {
          icon: <ArrowDownRight className="h-5 w-5 text-red-600" />,
          bg: 'bg-red-100',
          text: 'text-red-600 line-through',
          prefix: ''
        };
      default:
        return {
          icon: <Clock className="h-5 w-5 text-gray-600" />,
          bg: 'bg-gray-100',
          text: 'text-gray-600',
          prefix: ''
        };
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!transactions.length) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-500">
        No transactions found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => {
        const amount = typeof transaction.amount === 'string' 
          ? parseFloat(transaction.amount) 
          : transaction.amount;
        
        const styles = getTransactionStyles(transaction.type, transaction.status);
        const formattedDate = new Date(transaction.created_at).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

        return (
          <div key={transaction.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-full ${styles.bg}`}>
                  {styles.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900">
                      {transaction.type === 'advertiser_deposit' ? 'Account Deposit' : 'Task Payment'}
                    </h3>
                    {transaction.status === 'pending' && (
                      <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                        Pending
                      </span>
                    )}
                    {transaction.status === 'failed' && (
                      <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                        Failed
                      </span>
                    )}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    {formattedDate}
                  </div>
                  {transaction.task_id && (
                    <p className="text-sm text-gray-600 mt-1">
                      Task ID: {transaction.task_id}
                    </p>
                  )}
                </div>
              </div>
              <div className={`font-medium ${styles.text}`}>
                {styles.prefix}${Math.abs(amount).toFixed(2)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}