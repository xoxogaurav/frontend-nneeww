import React, { useState, useEffect } from 'react';
import { UserService, TransactionService } from '../services';
import { ArrowUpRight, ArrowDownRight, Clock, Users } from 'lucide-react';
import WithdrawalModal from './WithdrawalModal';
import toast from 'react-hot-toast';
import DebugPanel from './DebugPanel';

interface UserProfile {
  balance: string | number;
  pending_earnings: string | number;
  totalWithdrawn: string | number;
  referral_code?: string;
  referral_earnings?: string | number;
  referral_share?: string | number;
  referral_link?: string;
}

interface Transaction {
  id: number;
  taskId?: number;
  amount: string | number;
  type: 'earning' | 'withdrawal' | 'referral_bonus';
  status: 'completed' | 'pending' | 'failed';
  created_at?: string;
  createdAt?: string;
  task?: {
    title: string;
  };
}

export default function WalletScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const fetchData = async () => {
    try {
      const [profileData, transactionsData] = await Promise.all([
        UserService.getProfile(),
        TransactionService.getTransactions()
      ]);

      setProfile(profileData);
      setTransactions(transactionsData);

      setDebugInfo({
        profile: profileData,
        transactions: transactionsData
      });
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      toast.error('Failed to load wallet data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleWithdrawalSuccess = () => {
    fetchData();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="text-gray-500">Failed to load wallet data</div>
      </div>
    );
  }

  // Convert string values to numbers for calculations
  const numericBalance = typeof profile.balance === 'string' ? parseFloat(profile.balance) : profile.balance || 0;
  const numericPendingEarnings = typeof profile.pending_earnings === 'string' ? parseFloat(profile.pending_earnings) : profile.pending_earnings || 0;
  const numericTotalWithdrawn = typeof profile.totalWithdrawn === 'string' ? parseFloat(profile.totalWithdrawn) : profile.totalWithdrawn || 0;
  const numericReferralEarnings = typeof profile.referral_earnings === 'string' ? parseFloat(profile.referral_earnings) : profile.referral_earnings || 0;

  // Calculate total earnings (completed + pending)
  const totalEarnings = numericBalance + numericPendingEarnings;

  // Helper function to format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  // Get transaction status styles
  const getTransactionStyles = (type: string, status: string) => {
    if (type === 'withdrawal') {
      return {
        icon: <ArrowDownRight className="h-5 w-5 text-blue-600" />,
        bg: 'bg-blue-100',
        text: status === 'completed' ? 'text-gray-900' : 'text-gray-600',
        prefix: '-'
      };
    }

    if (type === 'referral_bonus') {
      return {
        icon: <Users className="h-5 w-5 text-purple-600" />,
        bg: 'bg-purple-100',
        text: status === 'completed' ? 'text-gray-900' : 'text-gray-600',
        prefix: '+'
      };
    }

    // For earnings
    switch (status) {
      case 'completed':
        return {
          icon: <ArrowUpRight className="h-5 w-5 text-green-600" />,
          bg: 'bg-green-100',
          text: 'text-gray-900',
          prefix: '+'
        };
      case 'pending':
        return {
          icon: <Clock className="h-5 w-5 text-yellow-600" />,
          bg: 'bg-yellow-100',
          text: 'text-gray-600',
          prefix: '+'
        };
      case 'failed':
        return {
          icon: <ArrowUpRight className="h-5 w-5 text-red-600" />,
          bg: 'bg-red-100',
          text: 'text-red-600 line-through',
          prefix: '+'
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

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Wallet</h1>
          <p className="mt-1 text-gray-500">Manage your earnings and withdrawals</p>
        </div>

        {/* Balance Cards */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl text-white p-6">
            <h2 className="text-lg opacity-90">Available Balance</h2>
            <p className="text-3xl font-bold mt-2">${numericBalance.toFixed(2)}</p>
            <p className="text-sm opacity-75 mt-2">Ready to withdraw</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h2 className="text-gray-600">Pending Earnings</h2>
            <p className="text-2xl font-bold mt-2 text-gray-900">${numericPendingEarnings.toFixed(2)}</p>
            <p className="text-sm text-gray-500 mt-2">Awaiting approval</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h2 className="text-gray-600">Total Earnings</h2>
            <p className="text-2xl font-bold mt-2 text-gray-900">${totalEarnings.toFixed(2)}</p>
            <p className="text-sm text-gray-500 mt-2">Lifetime earnings</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h2 className="text-gray-600">Referral Earnings</h2>
            <p className="text-2xl font-bold mt-2 text-gray-900">${numericReferralEarnings.toFixed(2)}</p>
            <p className="text-sm text-gray-500 mt-2">From referrals</p>
          </div>
        </div>

        {/* Withdraw Button */}
        <div className="mb-8">
          <button 
            onClick={() => setIsWithdrawalModalOpen(true)}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400"
            disabled={numericBalance <= 0}
          >
            Withdraw Funds
          </button>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {transactions.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                No transactions yet
              </div>
            ) : (
              transactions.map((transaction) => {
                const amount = typeof transaction.amount === 'string' 
                  ? parseFloat(transaction.amount) 
                  : transaction.amount;

                const dateString = transaction.created_at || transaction.createdAt;
                const styles = getTransactionStyles(transaction.type, transaction.status);

                return (
                  <div key={transaction.id} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${styles.bg}`}>
                        {styles.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">
                            {transaction.type === 'referral_bonus' 
                              ? 'Referral Bonus' 
                              : transaction.task?.title || 'Withdrawal'}
                          </p>
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
                          {formatDate(dateString)}
                        </div>
                      </div>
                    </div>
                    <div className={`font-medium ${styles.text}`}>
                      {styles.prefix}${amount.toFixed(2)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Withdrawal Modal */}
        {isWithdrawalModalOpen && (
          <WithdrawalModal
            onClose={() => setIsWithdrawalModalOpen(false)}
            onSuccess={handleWithdrawalSuccess}
            availableBalance={numericBalance}
          />
        )}

        {/* Debug Panel */}
        <DebugPanel
          request={debugInfo?.request}
          response={debugInfo?.response}
        />
      </div>
    </div>
  );
}