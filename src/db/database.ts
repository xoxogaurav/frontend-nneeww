import Dexie, { type Table } from 'dexie';

export interface Task {
  id?: number;
  title: string;
  description: string;
  reward: number | string;
  timeEstimate: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeInSeconds: number;
  steps: string[];
  approvalType: 'automatic' | 'manual';
  createdAt: Date;
  isActive?: boolean;
}

export interface User {
  id?: number;
  name: string;
  email: string;
  isAdmin: boolean;
  balance: number;
  pendingEarnings: number;
  totalWithdrawn: number;
  tasksCompleted: number;
  successRate: number;
  averageRating: number;
  createdAt: Date;
}

export interface Transaction {
  id?: number;
  userId: number;
  taskId?: number;
  amount: number;
  type: 'earning' | 'withdrawal';
  status: 'completed' | 'pending' | 'failed';
  createdAt: Date;
}

export interface TaskSubmission {
  id?: number;
  taskId: number;
  userId: number;
  screenshotUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
}

export interface Notification {
  id?: number;
  userId: number;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  isRead: boolean;
  createdAt: Date;
}

export interface TaskCompletion {
  id?: number;
  taskId: number;
  userId: number;
  completedAt: Date;
}

export class TaskFlowDB extends Dexie {
  tasks!: Table<Task>;
  users!: Table<User>;
  transactions!: Table<Transaction>;
  taskSubmissions!: Table<TaskSubmission>;
  notifications!: Table<Notification>;
  taskCompletions!: Table<TaskCompletion>;

  constructor() {
    super('TaskFlowDB');

    this.version(1).stores({
      tasks: '++id, category, difficulty, approvalType, createdAt',
      users: '++id, email, isAdmin, balance, createdAt',
      transactions: '++id, userId, taskId, type, status, createdAt',
      taskSubmissions: '++id, taskId, userId, status, submittedAt',
    });

    this.version(2).stores({
      notifications: '++id, userId, isRead, createdAt',
    });

    this.version(3).stores({
      taskCompletions: '++id, taskId, userId, completedAt, *taskUserId',
    }).upgrade(tx => {
      return tx.taskCompletions.toCollection().modify(completion => {
        completion.taskUserId = [completion.taskId, completion.userId];
      });
    });
  }
}

export const db = new TaskFlowDB();