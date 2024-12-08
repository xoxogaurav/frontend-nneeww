import React, { useState } from 'react';
import { X, DollarSign, AlertCircle } from 'lucide-react';
import WithdrawalService from '../services/withdrawals';
import { useAuth } from '../contexts/AuthContext';
import { UserService } from '../services';
import toast from 'react-hot-toast';
import DebugPanel from './DebugPanel';

interface WithdrawalModalProps {
  onClose: () => void;
  onSuccess: () => void;
  availableBalance: number;
}

export default function WithdrawalModal({ onClose, onSuccess, availableBalance }: WithdrawalModalProps) {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('paypal');
  const [paymentDetails, setPaymentDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  // Fetch user profile to check ID verification status
  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await UserService.getProfile();
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check ID verification status
    if (!profile?.governmentIdStatus || profile.governmentIdStatus !== 'approved') {
      toast.error('Please verify your government ID in settings before making a withdrawal');
      return;
    }

    setIsSubmitting(true);

    try {
      const numericAmount = parseFloat(amount);
      
      if (isNaN(numericAmount) || numericAmount <= 0) {
        throw new Error('Please enter a valid amount');
      }

      if (numericAmount > availableBalance) {
        throw new Error('Insufficient balance');
      }

      if (!paymentDetails.trim()) {
        throw new Error('Please provide payment details');
      }

      // Update debug info with request details
      setDebugInfo({
        request: {
          method: 'POST',
          url: '/withdrawals',
          data: {
            amount: numericAmount,
            payment_method: paymentMethod,
            payment_details: paymentDetails
          }
        }
      });

      const response = await WithdrawalService.createWithdrawal({
        amount: numericAmount,
        payment_method: paymentMethod,
        payment_details: paymentDetails
      });

      // Update debug info with response
      setDebugInfo(prev => ({
        ...prev,
        response: {
          status: 200,
          data: response
        }
      }));

      toast.success('Withdrawal request submitted successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Withdrawal error:', error);
      
      // Update debug info with error
      setDebugInfo(prev => ({
        ...prev,
        response: {
          status: error.response?.status || 500,
          error: error.message,
          data: error.response?.data
        }
      }));

      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show ID verification warning if not verified
  const showIdVerificationWarning = !profile?.governmentIdStatus || profile.governmentIdStatus !== 'approved';

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Withdraw Funds</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {showIdVerificationWarning ? (
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    ID Verification Required
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>You must verify your government ID before making withdrawals.</p>
                    <button
                      onClick={() => {
                        onClose();
                        window.location.href = '/settings';
                      }}
                      className="mt-2 text-red-800 underline hover:text-red-900"
                    >
                      Go to Settings to Verify ID
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Rest of the form remains the same */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Available Balance
              </label>
              <div className="mt-1 flex items-center text-lg font-semibold text-gray-900">
                <DollarSign className="h-5 w-5 text-gray-400" />
                {availableBalance.toFixed(2)}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Amount to Withdraw
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1"
                  step="0.01"
                  max={availableBalance}
                  className="block w-full pl-10 pr-12 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              >
                <option value="paypal">PayPal</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="crypto">Cryptocurrency</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Payment Details
              </label>
              <input
                type="text"
                value={paymentDetails}
                onChange={(e) => setPaymentDetails(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                placeholder={
                  paymentMethod === 'paypal' ? 'PayPal email address' :
                  paymentMethod === 'bank_transfer' ? 'Bank account details' :
                  'Wallet address'
                }
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-yellow-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Important Information
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Minimum withdrawal amount is $1.00</li>
                      <li>Processing time may take 1-3 business days</li>
                      <li>Please verify your payment details carefully</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
              >
                {isSubmitting ? 'Processing...' : 'Withdraw Funds'}
              </button>
            </div>
          </form>
        )}

        {/* Debug Panel */}
        <div className="px-6 pb-6">
          <DebugPanel
            request={debugInfo?.request}
            response={debugInfo?.response}
          />
        </div>
      </div>
    </div>
  );
}