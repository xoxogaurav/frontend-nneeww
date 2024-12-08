import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TaskCompletionStore {
  lastUpdate: number;
  completions: Record<string, { 
    hourly: number; 
    daily: number; 
    lastCompletion: string;
    lastSync: number;
  }>;
  updateCompletions: (taskId: number, userId: number, data: { hourly: number; daily: number }) => void;
  clearStaleData: () => void;
}

export const useTaskCompletionStore = create<TaskCompletionStore>()(
  persist(
    (set, get) => ({
      lastUpdate: Date.now(),
      completions: {},
      updateCompletions: (taskId, userId, data) => {
        const key = `${taskId}-${userId}`;
        const now = Date.now();
        set((state) => ({
          lastUpdate: now,
          completions: {
            ...state.completions,
            [key]: {
              ...data,
              lastCompletion: new Date().toISOString(),
              lastSync: now
            }
          }
        }));
      },
      clearStaleData: () => {
        const now = Date.now();
        const oneHourAgo = now - (60 * 60 * 1000);
        const oneDayAgo = now - (24 * 60 * 60 * 1000);
        
        set((state) => {
          const newCompletions = { ...state.completions };
          
          Object.entries(newCompletions).forEach(([key, data]) => {
            const completionTime = new Date(data.lastCompletion).getTime();
            
            // Clear hourly data if more than an hour old
            if (completionTime < oneHourAgo) {
              newCompletions[key].hourly = 0;
            }
            
            // Clear daily data if more than a day old
            if (completionTime < oneDayAgo) {
              newCompletions[key].daily = 0;
            }
          });
          
          return {
            lastUpdate: now,
            completions: newCompletions
          };
        });
      }
    }),
    {
      name: 'task-completions',
      version: 1
    }
  )
);