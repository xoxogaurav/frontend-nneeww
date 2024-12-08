import { loadStripe } from '@stripe/stripe-js';
import api from './api';

const stripePromise = loadStripe('pk_live_51OEqBqSGGTQNEQ39lnrSPesAdPNOX9gBr03YgMfQTUvTlNSqT3qItcHukQYkpWAIpvBEMyp2sjjLVGFNpN7UdJ3y00hrdmOlc8');

class StripeService {
  private static instance: StripeService | null = null;

  private constructor() {}

  public static getInstance(): StripeService {
    if (!StripeService.instance) {
      StripeService.instance = new StripeService();
    }
    return StripeService.instance;
  }

  public async createPaymentIntent(amount: number): Promise<{ clientSecret: string }> {
    try {
      const response = await api.post('https://bookmaster.fun/api/advertiser/payment/create-intent', {
        amount: Math.round(amount) // API expects amount in dollars
      });

      if (!response.data.parsed?.data?.clientSecret) {
        throw new Error('Invalid response: Missing client secret');
      }

      return {
        clientSecret: response.data.parsed.data.clientSecret
      };
    } catch (error: any) {
      console.error('Create payment intent error:', error);
      throw new Error(
        error.response?.data?.parsed?.message || 
        error.message || 
        'Failed to create payment intent'
      );
    }
  }

  public getStripe() {
    return stripePromise;
  }
}

export default StripeService.getInstance();