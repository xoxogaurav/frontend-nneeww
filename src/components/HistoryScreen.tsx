import React, { useState, useEffect } from 'react';
import { UserService, TransactionService } from '../services';
import { CheckCircle, XCircle, Clock, DollarSign, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import DebugPanel from './DebugPanel';

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected';

interface Transaction {
  id: number;
  task_id?: number;
  amount: string | number;
  type: 'earning' | 'withdrawal';
  status: 'completed' | 'pending' | 'failed';
  created_at: string;
  task?: {
    title: string;
    description: string;
  };
}

export default function HistoryScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await TransactionService.getTransactions();
        setTransactions(data);
        
        // Update debug info
        setDebugInfo({
          transactions: data
        });
      } catch (error) {
        console.error('Error fetching transactions:', error);
        toast.error('Failed to load transaction history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const filteredTransactions = transactions.filter(transaction => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'pending') return transaction.status === 'pending';
    if (filterStatus === 'approved') return transaction.status === 'completed';
    if (filterStatus === 'rejected') return transaction.status === 'failed';
    return true;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          label: 'Approved'
        };
      case 'pending':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          label: 'Pending'
        };
      case 'failed':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          label: 'Rejected'
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          label: 'Unknown'
        };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Task History</h1>
          <p className="mt-1 text-gray-500">View your completed, pending, and rejected tasks</p>
        </div>

        <div className="flex gap-2 mb-6">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filterStatus === status
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {!filteredTransactions || filteredTransactions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No transactions found
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => {
                const statusStyles = getStatusStyles(transaction.status);
                const amount = typeof transaction.amount === 'string' 
                  ? parseFloat(transaction.amount) 
                  : transaction.amount;

                return (
                  <div key={transaction.id} className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start space-x-4">
                        <div className={`p-2 rounded-full ${statusStyles.bg}`}>
                          {getStatusIcon(transaction.status)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-medium text-gray-900">
                              {transaction.task?.title || 'Withdrawal'}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles.bg} ${statusStyles.text}`}>
                              {statusStyles.label}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-gray-500">
                            {new Date(transaction.created_at).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          {transaction.task?.description && (
                            <p className="mt-2 text-sm text-gray-600">
                              {transaction.task.description}
                            </p>
                          )}
                          {transaction.status === 'failed' && (
                            <p className="mt-2 text-sm text-red-600 flex items-center">
                              <AlertTriangle className="h-4 w-4 mr-1" />
                              Task submission was rejected
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className={`h-5 w-5 ${
                          transaction.status === 'failed' ? 'text-red-400' : 'text-gray-400'
                        }`} />
                        <span className={`text-lg font-medium ${
                          transaction.status === 'failed' ? 'text-red-600 line-through' : 'text-gray-900'
                        }`}>
                          {amount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      
      </div>
    </div>
  );
}