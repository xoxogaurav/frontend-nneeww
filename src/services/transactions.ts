import api from './api';
import type { Transaction } from '../db/database';

export interface TransactionResponse {
  success: boolean;
  data: Transaction[];
}

export interface WithdrawalResponse {
  success: boolean;
  data: {
    transaction: Transaction;
  };
}

class TransactionService {
  private static instance: TransactionService;

  private constructor() {}

  public static getInstance(): TransactionService {
    if (!TransactionService.instance) {
      TransactionService.instance = new TransactionService();
    }
    return TransactionService.instance;
  }

  public async getTransactions(): Promise<Transaction[]> {
    try {
      const response = await api.get<TransactionResponse>('/transactions');
      return response.data.parsed?.data || [];
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch transactions'
      );
    }
  }

  public async withdraw(amount: number): Promise<Transaction> {
    try {
      const response = await api.post<WithdrawalResponse>('/transactions/withdraw', { amount });
      if (!response.data.parsed?.data?.transaction) {
        throw new Error('Invalid response format');
      }
      return response.data.parsed.data.transaction;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to process withdrawal'
      );
    }
  }
}

export default TransactionService.getInstance();