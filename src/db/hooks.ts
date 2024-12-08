import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useState } from 'react';
import { TaskService, UserService, TransactionService, NotificationService } from '../services';
import type { Task, Transaction, TaskSubmission, User } from './database';

// Hook to get current user
export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const profile = await UserService.getProfile();
        setUser(profile);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch user'));
      }
    };

    if (localStorage.getItem('token')) {
      fetchUser();
    }
  }, []);

  return user;
}

// Hook to get all tasks
export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const tasks = await TaskService.getTasks();
        setTasks(tasks);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch tasks'));
      }
    };

    fetchTasks();
  }, []);

  return tasks;
}

// Hook to get user transactions
export function useUserTransactions(userId: number) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const transactions = await TransactionService.getTransactions();
        setTransactions(transactions);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch transactions'));
      }
    };

    if (userId) {
      fetchTransactions();
    }
  }, [userId]);

  return transactions;
}

// Hook to get user task submissions
export function useTaskSubmissions(userId: number) {
  const [submissions, setSubmissions] = useState<(TaskSubmission & { task?: Task })[]>([]);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        // This endpoint would need to be added to the API
        // For now, we'll return an empty array
        setSubmissions([]);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch submissions'));
      }
    };

    if (userId) {
      fetchSubmissions();
    }
  }, [userId]);

  return submissions;
}

// Function to complete a task
export async function completeTask(taskId: number, userId: number, screenshotUrl: string) {
  try {
    const result = await TaskService.submitTask(taskId, screenshotUrl);
    return result.submission.id;
  } catch (error) {
    throw error instanceof Error ? error : new Error('Failed to submit task');
  }
}