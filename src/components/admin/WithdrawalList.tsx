import React, { useState } from 'react';
import { CheckCircle, XCircle, DollarSign } from 'lucide-react';
import { AdminService } from '../../services';
import type { PendingWithdrawal } from '../../services/admin';
import toast from 'react-hot-toast';
import DebugPanel from '../DebugPanel';

interface WithdrawalListProps {
  withdrawals: PendingWithdrawal[];
  onWithdrawalUpdate: () => void;
}

export default function WithdrawalList({ withdrawals, onWithdrawalUpdate }: WithdrawalListProps) {
  const [isProcessing, setIsProcessing] = useState<number | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const handleProcess = async (withdrawalId: number, status: 'approved' | 'rejected') => {
    if (isProcessing) return;
    
    setIsProcessing(withdrawalId);
    
    try {
      // Update debug info with request details
      setDebugInfo({
        request: {
          method: 'PUT',
          url: `/admin/withdrawals/${withdrawalId}/process`,
          data: { status }
        }
      });

      await AdminService.processWithdrawal(withdrawalId, status);
      
      setDebugInfo(prev => ({
        ...prev,
        response: {
          status: 200,
          data: { status, withdrawalId }
        }
      }));

      toast.success(`Withdrawal ${status}`);
      onWithdrawalUpdate();
    } catch (error: any) {
      console.error('Processing error:', error);
      
      setDebugInfo(prev => ({
        ...prev,
        response: {
          status: error.response?.status || 500,
          error: error.message,
          data: error.response?.data
        }
      }));

      toast.error(`Failed to ${status} withdrawal`);
    } finally {
      setIsProcessing(null);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
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

  if (!withdrawals?.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        No pending withdrawals
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {withdrawals.map((withdrawal) => {
        const amount = typeof withdrawal.amount === 'string' 
          ? parseFloat(withdrawal.amount) 
          : withdrawal.amount;

        return (
          <div key={withdrawal.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{withdrawal.user.name}</h3>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Pending Review
                  </span>
                </div>
                <p className="text-sm text-gray-600">Email: {withdrawal.user.email}</p>
                <p className="text-sm text-gray-600">
                  Payment Method: {withdrawal.payment_method}
                </p>
                <p className="text-sm text-gray-600">
                  Payment Details: {withdrawal.payment_details}
                </p>
                <p className="text-sm text-gray-500">
                  Requested at: {formatDate(withdrawal.created_at)}
                </p>
              </div>

              <div className="text-right">
                <div className="flex items-center text-xl font-bold text-gray-900 mb-2">
                  <DollarSign className="h-5 w-5" />
                  {amount.toFixed(2)}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleProcess(withdrawal.id, 'approved')}
                    disabled={isProcessing === withdrawal.id}
                    className="flex items-center px-3 py-1 text-sm font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleProcess(withdrawal.id, 'rejected')}
                    disabled={isProcessing === withdrawal.id}
                    className="flex items-center px-3 py-1 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Debug Panel */}
      <DebugPanel
        request={debugInfo?.request}
        response={debugInfo?.response}
      />
    </div>
  );
}