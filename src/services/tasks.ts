import api from './api';
import { db } from '../db/database';
import type { Task, TaskSubmission } from '../db/database';
import { useTaskCompletionStore } from '../stores/taskCompletionStore';

export interface TaskResponse {
  success: boolean;
  data: Task[];
}

export interface TaskSubmissionResponse {
  success: boolean;
  data: {
    submission: TaskSubmission;
    transaction: {
      id: number;
      amount: number;
      type: string;
      status: string;
    };
  };
}

class TaskService {
  private static instance: TaskService;

  private constructor() {}

  public static getInstance(): TaskService {
    if (!TaskService.instance) {
      TaskService.instance = new TaskService();
    }
    return TaskService.instance;
  }

  public async getTasks(): Promise<Task[]> {
    try {
      const response = await api.get<TaskResponse>('/tasks');
      
      if (!response.data.parsed?.success || !response.data.parsed?.data) {
        console.error('Invalid task response:', response.data);
        throw new Error('Invalid response format');
      }

      return response.data.parsed.data;
    } catch (error: any) {
      console.error('Error fetching tasks:', error);
      throw new Error(
        error.response?.data?.parsed?.message || 
        error.message || 
        'Failed to fetch tasks'
      );
    }
  }

  public async submitTask(taskId: number, screenshotUrl: string): Promise<TaskSubmissionResponse['data']> {
    try {
      console.log('Submitting task:', { taskId, screenshotUrl });
      
      const response = await api.post<TaskSubmissionResponse>(`/tasks/${taskId}/submit`, {
        screenshot_url: screenshotUrl
      });

      if (!response.data.parsed?.success || !response.data.parsed?.data) {
        console.error('Invalid submission response:', response.data);
        throw new Error('Invalid response format');
      }

      // Record task completion and update store
      const userId = await this.getCurrentUserId();
      if (userId) {
        await this.recordTaskCompletion(taskId, userId);
        const completionData = await this.getTaskCompletions(taskId, userId);
        useTaskCompletionStore.getState().updateCompletions(taskId, userId, {
          hourly: completionData.hourly,
          daily: completionData.daily
        });
      }

      return response.data.parsed.data;
    } catch (error: any) {
      console.error('Task submission error:', error);
      throw new Error(
        error.response?.data?.parsed?.message || 
        error.message || 
        'Failed to submit task'
      );
    }
  }

  private async recordTaskCompletion(taskId: number, userId: number): Promise<void> {
    try {
      // Clean up old completions
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      await db.taskCompletions
        .where('completedAt')
        .below(oneDayAgo)
        .delete();

      // Add new completion
      await db.taskCompletions.add({
        taskId,
        userId,
        completedAt: new Date()
      });

      console.log('Task completion recorded successfully');
    } catch (error) {
      console.error('Error recording task completion:', error);
      throw error;
    }
  }

  public async getTaskCompletions(taskId: number, userId: number): Promise<{ hourly: number; daily: number; lastCompletion: Date | null }> {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));

    try {
      const completions = await db.taskCompletions
        .where(['taskId', 'userId'])
        .equals([taskId, userId])
        .toArray();

      const hourlyCount = completions.filter(c => c.completedAt >= oneHourAgo).length;
      const dailyCount = completions.filter(c => c.completedAt >= startOfDay).length;
      
      const sortedCompletions = completions.sort((a, b) => 
        b.completedAt.getTime() - a.completedAt.getTime()
      );
      const lastCompletion = sortedCompletions.length > 0 ? sortedCompletions[0].completedAt : null;

      return {
        hourly: hourlyCount,
        daily: dailyCount,
        lastCompletion
      };
    } catch (error) {
      console.error('Error getting task completions:', error);
      return { hourly: 0, daily: 0, lastCompletion: null };
    }
  }

  private async getCurrentUserId(): Promise<number | null> {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const response = await api.get('/users/profile');
      return response.data.parsed?.data?.id || null;
    } catch {
      return null;
    }
  }
}

export default TaskService.getInstance();