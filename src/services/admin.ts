import api from './api';
import type { Task, TaskSubmission, User, Transaction } from '../db/database';

export interface AdminStats {
  users: number;
  tasks: number;
  pendingSubmissions: number;
  totalEarnings: number;
}

export interface ReviewResponse {
  success: boolean;
  data: {
    submission: TaskSubmission;
    transaction: Transaction;
  };
}

export interface PendingWithdrawal {
  id: number;
  user_id: number;
  amount: string | number;
  status: 'pending' | 'approved' | 'rejected';
  payment_method: string;
  payment_details: string;
  created_at: string;
  processed_at: string | null;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export interface TaskCreateData {
  title: string;
  description: string;
  reward: number;
  time_estimate: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  time_in_seconds: number;
  steps: string[];
  approval_type: 'automatic' | 'manual';
  allowed_countries: string[];
  hourly_limit: number;
  daily_limit: number;
  total_submission_limit: number;
  daily_submission_limit: number;
  is_active: boolean;
  one_off: boolean;
}

export interface TaskUpdateData {
  title?: string;
  description?: string;
  reward?: number;
  time_estimate?: string;
  category?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  time_in_seconds?: number;
  steps?: string[];
  approval_type?: 'automatic' | 'manual';
  allowed_countries?: string[];
  hourly_limit?: number;
  daily_limit?: number;
  total_submission_limit?: number;
  daily_submission_limit?: number;
  is_active?: boolean;
  one_off?: boolean;
}

export interface NotificationPayload {
  user_ids: number[];
  title: string;
  message: string;
  data: {
    message: string;
  };
  notification: {
    title: string;
    body: string;
    badge: number;
    sound: string;
    url?: string;
  };
}

export interface BroadcastPayload {
  title: string;
  message: string;
  url?: string;
  image?: string;
}

class AdminService {
  private static instance: AdminService | null = null;

  private constructor() {}

  public static getInstance(): AdminService {
    if (!AdminService.instance) {
      AdminService.instance = new AdminService();
    }
    return AdminService.instance;
  }

  public async getUsers(): Promise<User[]> {
    try {
      const response = await api.get('/admin/users');
      return response.data.parsed?.data || [];
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Failed to fetch users'
      );
    }
  }

  public async getPendingWithdrawals(): Promise<PendingWithdrawal[]> {
    try {
      const response = await api.get('/admin/withdrawals/pending');
      return response.data.parsed?.data || [];
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Failed to fetch pending withdrawals'
      );
    }
  }

  public async processWithdrawal(withdrawalId: number, status: 'approved' | 'rejected'): Promise<void> {
    try {
      await api.put(`/admin/withdrawals/${withdrawalId}/process`, { status });
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Failed to process withdrawal'
      );
    }
  }

  public async getPendingIdVerifications(): Promise<User[]> {
    try {
      const response = await api.get('/admin/users/pending-verifications');
      return response.data.parsed?.data || [];
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Failed to fetch pending verifications'
      );
    }
  }

  public async verifyUserId(userId: number, status: 'approved' | 'rejected'): Promise<void> {
    try {
      await api.put(`https://bookmaster.fun/api/admin/${userId}/verify-id`, {
        status
      });
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Failed to verify user ID'
      );
    }
  }

  public async getPendingSubmissions(): Promise<TaskSubmission[]> {
    try {
      const response = await api.get('/admin/submissions/pending');
      return response.data.parsed?.data || [];
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Failed to fetch pending submissions'
      );
    }
  }

  public async getPendingTasks(): Promise<Task[]> {
    try {
      const response = await api.get('https://bookmaster.fun/api/admin/tasks/pending');
      return response.data.parsed?.data || [];
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Failed to fetch pending tasks'
      );
    }
  }

  public async reviewTask(taskId: number, status: 'approved' | 'rejected', feedback: string): Promise<void> {
    try {
      await api.put(`https://bookmaster.fun/api/admin/tasks/${taskId}/review`, {
        status,
        feedback
      });
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Failed to review task'
      );
    }
  }

  public async getDashboardStats(): Promise<AdminStats> {
    try {
      const response = await api.get('/admin/stats');
      return (
        response.data.parsed?.data || {
          users: 0,
          tasks: 0,
          pendingSubmissions: 0,
          totalEarnings: 0,
        }
      );
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Failed to fetch dashboard stats'
      );
    }
  }

  public async createTask(taskData: TaskCreateData): Promise<Task> {
    try {
      const apiData = {
        title: taskData.title,
        description: taskData.description,
        reward: taskData.reward,
        time_estimate: taskData.time_estimate,
        category: taskData.category,
        difficulty: taskData.difficulty,
        time_in_seconds: taskData.time_in_seconds,
        steps: taskData.steps,
        approval_type: taskData.approval_type,
        allowed_countries: taskData.allowed_countries,
        hourly_limit: taskData.hourly_limit,
        daily_limit: taskData.daily_limit,
        total_submission_limit: taskData.total_submission_limit,
        daily_submission_limit: taskData.daily_submission_limit,
        is_active: taskData.is_active,
        one_off: taskData.one_off,
      };

      console.log('Creating task with data:', apiData);
      const response = await api.post('/tasks', apiData);
      return response.data.parsed?.data;
    } catch (error: any) {
      console.error('Create task error:', error);
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Failed to create task'
      );
    }
  }

  public async updateTask(
    taskId: number,
    taskData: TaskUpdateData
  ): Promise<Task> {
    try {
      const apiData = {
        title: taskData.title,
        description: taskData.description,
        reward: taskData.reward,
        time_estimate: taskData.time_estimate,
        category: taskData.category,
        difficulty: taskData.difficulty,
        time_in_seconds: taskData.time_in_seconds,
        steps: taskData.steps,
        approval_type: taskData.approval_type,
        allowed_countries: taskData.allowed_countries,
        hourly_limit: taskData.hourly_limit,
        daily_limit: taskData.daily_limit,
        total_submission_limit: taskData.total_submission_limit,
        daily_submission_limit: taskData.daily_submission_limit,
        is_active: taskData.is_active,
        one_off: taskData.one_off,
      };

      console.log('Updating task with data:', apiData);
      const response = await api.put(`/tasks/${taskId}`, apiData);
      return response.data.parsed?.data;
    } catch (error: any) {
      console.error('Update task error:', error);
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Failed to update task'
      );
    }
  }

  public async reviewSubmission(
    taskId: number,
    submission_id: number,
    status: 'approved' | 'rejected'
  ): Promise<ReviewResponse['data']> {
    try {
      console.log('Reviewing submission:', { taskId, submission_id, status });

      const response = await api.put<ReviewResponse>(
        `/tasks/${taskId}/review`,
        {
          submission_id,
          status,
        }
      );

      console.log('Review response:', response.data);

      if (!response.data.parsed?.success || !response.data.parsed?.data) {
        console.error('Invalid review response:', response.data);
        throw new Error('Invalid response format');
      }

      return response.data.parsed.data;
    } catch (error: any) {
      console.error('Review submission error:', error);
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Failed to review submission'
      );
    }
  }

  public async sendNotification(payload: NotificationPayload): Promise<void> {
    try {
      await api.post('https://bookmaster.fun/api/admin/notifications/send', payload);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Failed to send notification'
      );
    }
  }

  public async broadcastNotification(payload: BroadcastPayload): Promise<void> {
    try {
      await api.post('https://bookmaster.fun/api/admin/notifications/broadcast', payload);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Failed to broadcast notification'
      );
    }
  }
}

export default AdminService.getInstance();