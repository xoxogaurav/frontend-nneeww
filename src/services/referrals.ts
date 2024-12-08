import api from './api';

export interface ReferralStats {
  total_referral_earnings: string;
  referral_share: string;
  referral_code: string;
  referral_link: string;
  total_referred_users: number;
  referred_users: {
    username: string;
    joined_date: string;
    tasks_completed: number;
    total_earnings: string | null;
    current_balance: string;
    total_withdrawn: string;
  }[];
  daily_earnings: {
    date: string;
    amount: string;
  }[];
}

class ReferralService {
  private static instance: ReferralService;

  private constructor() {}

  public static getInstance(): ReferralService {
    if (!ReferralService.instance) {
      ReferralService.instance = new ReferralService();
    }
    return ReferralService.instance;
  }

  public async getReferralStats(): Promise<ReferralStats> {
    try {
      const response = await api.get('https://bookmaster.fun/api/referrals/stats');
      
      if (!response.data.parsed?.success || !response.data.parsed?.data) {
        throw new Error('Invalid response format');
      }

      return response.data.parsed.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch referral stats'
      );
    }
  }
}

export default ReferralService.getInstance();