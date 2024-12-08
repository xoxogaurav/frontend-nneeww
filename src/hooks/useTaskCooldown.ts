import { useState, useEffect } from 'react';
import { TaskService } from '../services';
import { useAuth } from '../contexts/AuthContext';
import { useTaskCompletionStore } from '../stores/taskCompletionStore';

interface TaskLimits {
  isOnCooldown: boolean;
  cooldownTimeLeft: string | null;
  hourlyCompletions: number;
  dailyCompletions: number;
  canComplete: boolean;
  limitMessage: string | null;
}

const COOLDOWN_DURATION = 30 * 60 * 1000; // 30 minutes
const SYNC_INTERVAL = 30 * 1000; // 30 seconds

export function useTaskCooldown(taskId: number, hourlyLimit: number = 0, dailyLimit: number = 0): TaskLimits {
  const { user } = useAuth();
  const { lastUpdate, completions, clearStaleData } = useTaskCompletionStore();
  const [limits, setLimits] = useState<TaskLimits>({
    isOnCooldown: false,
    cooldownTimeLeft: null,
    hourlyCompletions: 0,
    dailyCompletions: 0,
    canComplete: true,
    limitMessage: null
  });

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const checkLimits = async () => {
      if (!user?.id || !taskId) return;

      try {
        const key = `${taskId}-${user.id}`;
        const storedCompletion = completions[key];
        const now = Date.now();

        // Clear stale data periodically
        clearStaleData();

        // Fetch fresh data if store is stale or missing
        let hourly = 0;
        let daily = 0;
        let lastCompletion: Date | null = null;

        if (!storedCompletion || now - storedCompletion.lastSync > SYNC_INTERVAL) {
          const freshData = await TaskService.getTaskCompletions(taskId, user.id);
          hourly = freshData.hourly;
          daily = freshData.daily;
          lastCompletion = freshData.lastCompletion;
        } else {
          hourly = storedCompletion.hourly;
          daily = storedCompletion.daily;
          lastCompletion = new Date(storedCompletion.lastCompletion);
        }

        // Calculate limits and cooldown
        let isOnCooldown = false;
        let cooldownTimeLeft = null;
        let limitMessage = null;
        let canComplete = true;

        if (lastCompletion) {
          const timeSinceLastCompletion = now - lastCompletion.getTime();
          
          if (timeSinceLastCompletion < COOLDOWN_DURATION) {
            isOnCooldown = true;
            const timeLeft = COOLDOWN_DURATION - timeSinceLastCompletion;
            const minutesLeft = Math.ceil(timeLeft / (60 * 1000));
            cooldownTimeLeft = `${minutesLeft}m`;
            limitMessage = `Please wait ${cooldownTimeLeft} before attempting this task again`;
            canComplete = false;
          }
        }

        // Check hourly limit
        if (hourlyLimit > 0 && hourly >= hourlyLimit) {
          const nextHourDate = new Date(now + (60 * 60 * 1000));
          const minutesUntilReset = Math.ceil((nextHourDate.getTime() - now) / (60 * 1000));
          limitMessage = `Hourly limit (${hourlyLimit}) reached. Next attempt available in ${minutesUntilReset}m`;
          canComplete = false;
        }

        // Check daily limit
        if (dailyLimit > 0 && daily >= dailyLimit) {
          const tomorrow = new Date(now);
          tomorrow.setHours(24, 0, 0, 0);
          const hoursUntilReset = Math.ceil((tomorrow.getTime() - now) / (60 * 60 * 1000));
          limitMessage = `Daily limit (${dailyLimit}) reached. Next attempt available in ${hoursUntilReset}h`;
          canComplete = false;
        }

        setLimits({
          isOnCooldown,
          cooldownTimeLeft,
          hourlyCompletions: hourly,
          dailyCompletions: daily,
          canComplete,
          limitMessage
        });
      } catch (error) {
        console.error('Error checking task limits:', error);
      }
    };

    checkLimits();
    intervalId = setInterval(checkLimits, SYNC_INTERVAL);

    return () => clearInterval(intervalId);
  }, [taskId, user?.id, hourlyLimit, dailyLimit, lastUpdate]);

  return limits;
}