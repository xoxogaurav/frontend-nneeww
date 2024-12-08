import React from 'react';
import { ListChecks } from 'lucide-react';

interface TaskStepsProps {
  steps: string[];
  currentStepIndex: number;
  mode?: 'preview' | 'progress';
}

export default function TaskSteps({ steps, currentStepIndex, mode = 'preview' }: TaskStepsProps) {
  if (mode === 'preview') {
    return (
      <div className="border-t border-b border-gray-200 py-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Steps to complete:</h2>
        <ol className="space-y-3">
          {steps.map((step, index) => (
            <li key={index} className="flex items-start">
              <span className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-medium">
                {index + 1}
              </span>
              <span className="ml-3 text-gray-600">{step}</span>
            </li>
          ))}
        </ol>
      </div>
    );
  }

  return (
      <div className="border-t border-b border-gray-200 py-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Steps to complete:</h2>
        <ol className="space-y-3">
          {steps.map((step, index) => (
            <li key={index} className="flex items-start">
              <span className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-medium">
                {index + 1}
              </span>
              <span className="ml-3 text-gray-600">{step}</span>
            </li>
          ))}
        </ol>
      </div>
    );
}