import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface TaskTimerProps {
  initialSeconds: number | string;
  onComplete: () => void;
  isRunning: boolean;
}

export default function TaskTimer({ initialSeconds, onComplete, isRunning }: TaskTimerProps) {
  // Convert initialSeconds to number and handle invalid values
  const parsedInitialSeconds = typeof initialSeconds === 'string' 
    ? parseInt(initialSeconds, 10) 
    : initialSeconds;

  const [timeLeft, setTimeLeft] = useState<number>(
    isNaN(parsedInitialSeconds) ? 0 : parsedInitialSeconds
  );

  // Reset timer when initialSeconds changes
  useEffect(() => {
    const seconds = typeof initialSeconds === 'string' 
      ? parseInt(initialSeconds, 10) 
      : initialSeconds;
    
    if (!isNaN(seconds)) {
      setTimeLeft(seconds);
    }
  }, [initialSeconds]);

  // Timer logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          const newValue = Math.max(0, prev - 1);
          if (newValue === 0) {
            onComplete();
          }
          return newValue;
        });
      }, 1000);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [isRunning, timeLeft, onComplete]);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="text-center">
      <div className="text-4xl font-bold text-gray-900 mb-2">
        {formatTime(timeLeft)}
      </div>
      <p className="text-gray-600 flex items-center justify-center">
        <Clock className="h-4 w-4 mr-1" />
        Time remaining
      </p>
    </div>
  );
}