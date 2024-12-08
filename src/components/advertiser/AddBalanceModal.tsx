import React, { useState } from 'react';
import { X, DollarSign, CreditCard, AlertCircle } from 'lucide-react';
import { CardElement, Elements, useStripe, useElements } from '@stripe/react-stripe-js';
import StripeService from '../../services/stripe';
import toast from 'react-hot-toast';
import DebugPanel from '../DebugPanel';

interface AddBalanceModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#32325d',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#aab7c4'
      }
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a'
    }
  },
  hidePostalCode: true
};

const AddBalanceForm = ({ onClose, onSuccess }: AddBalanceModalProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      toast.error('Stripe is not initialized');
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsProcessing(true);
    setCardError(null);

    try {
      // Create payment intent
      const { clientSecret } = await StripeService.createPaymentIntent(numericAmount);

      setDebugInfo({
        request: {
          method: 'POST',
          url: 'https://bookmaster.fun/api/advertiser/payment/create-intent',
          data: { amount: numericAmount }
        }
      });

      // Get card element
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // Confirm payment
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement
        }
      });

      if (result.error) {
        console.error('Payment error:', result.error);
        setCardError(result.error.message || 'Payment failed');
        throw new Error(result.error.message || 'Payment failed');
      }

      setDebugInfo(prev => ({
        ...prev,
        response: {
          status: 200,
          data: result.paymentIntent
        }
      }));

      toast.success('Payment successful! Balance updated.');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Payment error:', error);
      
      setDebugInfo(prev => ({
        ...prev,
        response: {
          status: error.response?.status || 500,
          error: error.message,
          data: error.response?.data
        }
      }));

      toast.error(error.message || 'Payment failed');
      setCardError(error.message || 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCardChange = (event: any) => {
    setCardError(event.error ? event.error.message : null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Amount</label>
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
            className="block w-full pl-10 pr-12 py-2 sm:text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Card Details
        </label>
        <div className="p-4 border border-gray-300 rounded-md bg-white shadow-sm transition-all">
          <CardElement 
            options={CARD_ELEMENT_OPTIONS}
            onChange={handleCardChange}
          />
        </div>
        {cardError && (
          <p className="text-sm text-red-600">{cardError}</p>
        )}
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
                <li>Minimum deposit amount is $1.00</li>
                <li>Your balance will be updated instantly</li>
                <li>All transactions are secure and encrypted</li>
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
          disabled={isProcessing || !stripe}
          className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
        >
          {isProcessing ? (
            'Processing...'
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              Add Balance
            </>
          )}
        </button>
      </div>

      <DebugPanel
        request={debugInfo?.request}
        response={debugInfo?.response}
      />
    </form>
  );
};

export default function AddBalanceModal({ onClose, onSuccess }: AddBalanceModalProps) {
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add Balance</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <Elements stripe={StripeService.getStripe()}>
            <AddBalanceForm onClose={onClose} onSuccess={onSuccess} />
          </Elements>
        </div>
      </div>
    </div>
  );
}