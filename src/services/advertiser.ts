import api from './api';

export interface AdvertiserBalance {
  balance: number;
  total_spent: number;
}

export interface AdvertiserTask {
  id: number;
  title: string;
  reward: number;
  total_budget: number;
  remaining_budget: number;
  is_active: boolean;
  admin_status?: 'pending' | 'approved' | 'rejected';
  admin_feedback?: string;
  created_at: string;
  description: string;
}

export interface TaskStats {
  total_submissions: number;
  approved_submissions: number;
  pending_submissions: number;
  rejected_submissions: number;
  remaining_budget: number;
  spent_budget: number;
  daily_stats: Array<{
    date: string;
    submissions: number;
    approved: number;
    rejected: number;
  }>;
}

export interface Transaction {
  id: number;
  user_id: number;
  task_id: number | null;
  amount: string | number;
  type: 'task_payment' | 'advertiser_deposit';
  status: 'completed' | 'pending' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface PendingSubmission {
  id: number;
  task_id: number;
  user_id: number;
  screenshot_url: string;
  status: 'pending';
  created_at: string;
  user: {
    name: string;
    email: string;
  };
  task: {
    title: string;
  };
}

class AdvertiserService {
  private static instance: AdvertiserService | null = null;

  private constructor() {}

  public static getInstance(): AdvertiserService {
    if (!AdvertiserService.instance) {
      AdvertiserService.instance = new AdvertiserService();
    }
    return AdvertiserService.instance;
  }

  public async getBalance(): Promise<AdvertiserBalance> {
    try {
      const response = await api.get('/advertiser/balance');
      return response.data.parsed.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch balance');
    }
  }

  public async getTasks(): Promise<AdvertiserTask[]> {
    try {
      const response = await api.get('/advertiser/tasks');
      return response.data.parsed.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch tasks');
    }
  }

  public async getTaskStats(taskId: number): Promise<TaskStats> {
    try {
      const response = await api.get(`/advertiser/tasks/${taskId}/stats`);
      return response.data.parsed.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch task stats');
    }
  }

  public async getTransactions(): Promise<Transaction[]> {
    try {
      const response = await api.get('/advertiser/transactions');
      return response.data.parsed.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch transactions');
    }
  }

  public async getPendingSubmissions(): Promise<PendingSubmission[]> {
    try {
      const response = await api.get('/advertiser/submissions/pending');
      return response.data.parsed.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch pending submissions');
    }
  }

  public async reviewSubmission(submissionId: number, status: 'approved' | 'rejected'): Promise<void> {
    try {
      await api.put(`/advertiser/submissions/${submissionId}/review`, { status });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to review submission');
    }
  }

  public async createTask(taskData: any): Promise<AdvertiserTask> {
    try {
      const response = await api.post('/advertiser/tasks', taskData);
      return response.data.parsed.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create task');
    }
  }

  public async updateTask(taskId: number, taskData: any): Promise<AdvertiserTask> {
    try {
      const response = await api.put(`/advertiser/tasks/${taskId}`, taskData);
      return response.data.parsed.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update task');
    }
  }
}

export default AdvertiserService.getInstance();