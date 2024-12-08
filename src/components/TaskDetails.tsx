import React, { useState } from 'react';
import { ArrowLeft, Upload, Check, Zap, UserCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { TaskService, UploadService } from '../services';
import toast from 'react-hot-toast';
import TaskTimer from './TaskTimer';
import TaskSteps from './TaskSteps';
import DebugPanel from './DebugPanel';

interface TaskDetailsProps {
  task: {
    id: number;
    title: string;
    description: string;
    reward: string | number;
    time_estimate?: string;
    timeEstimate?: string;
    category: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    approval_type?: string;
    approvalType?: 'automatic' | 'manual';
    steps: string[];
    time_in_seconds?: string | number;
    timeInSeconds?: string | number;
  };
  onBack: () => void;
}

export default function TaskDetails({ task, onBack }: TaskDetailsProps) {
  const { user } = useAuth();
  const [status, setStatus] = useState<'preview' | 'in-progress' | 'completed'>('preview');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  // Normalize task data to handle both API and local format
  const normalizedTask = {
    ...task,
    timeEstimate: task.time_estimate || task.timeEstimate,
    approvalType: task.approval_type || task.approvalType,
    timeInSeconds: task.time_in_seconds || task.timeInSeconds
  };

  // Parse time in seconds
  const timeInSeconds = typeof normalizedTask.timeInSeconds === 'string' 
    ? parseInt(normalizedTask.timeInSeconds, 10)
    : typeof normalizedTask.timeInSeconds === 'number'
      ? normalizedTask.timeInSeconds
      : 0;

  // Parse reward
  const reward = typeof task.reward === 'string' 
    ? parseFloat(task.reward)
    : task.reward;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleTimerComplete = () => {
    setCurrentStepIndex(task.steps.length - 1);
  };

  const handleSubmit = async () => {
    if (!selectedFile || !user?.id || !task.id) return;
    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      // First upload the image
      const uploadedUrl = await UploadService.uploadImage(selectedFile);
      setUploadProgress(50);

      // Update debug info with request details
      setDebugInfo({
        request: {
          method: 'POST',
          url: `/tasks/${task.id}/submit`,
          data: {
            screenshotUrl: uploadedUrl
          }
        }
      });

      // Then submit the task with the uploaded image URL
      const response = await TaskService.submitTask(task.id, uploadedUrl);
      setUploadProgress(100);

      // Update debug info with response
      setDebugInfo(prev => ({
        ...prev,
        response: {
          status: 200,
          data: response
        }
      }));

      setStatus('completed');
      
      toast.success(
        normalizedTask.approvalType === 'automatic'
          ? 'Task completed! Reward added to your balance.'
          : 'Task submitted for review!'
      );
    } catch (error: any) {
      console.error('Task submission error:', error);
      
      // Update debug info with error
      setDebugInfo(prev => ({
        ...prev,
        response: {
          status: error.response?.status || 500,
          error: error.message,
          data: error.response?.data
        }
      }));

      toast.error('Failed to submit task');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to tasks
        </button>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* Task header section */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
                <span className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  normalizedTask.approvalType === 'automatic' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-purple-100 text-purple-800'
                }`}>
                  {normalizedTask.approvalType === 'automatic' ? (
                    <><Zap className="h-3 w-3 mr-1" /> Instant Approval</>
                  ) : (
                    <><UserCheck className="h-3 w-3 mr-1" /> Manual Review</>
                  )}
                </span>
              </div>
              <p className="text-gray-600">{task.description}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-indigo-600">
                ${reward.toFixed(2)}
              </div>
              <div className="text-sm text-gray-500">{normalizedTask.timeEstimate}</div>
            </div>
          </div>

          {/* Task content based on status */}
          {status === 'preview' && (
            <div className="space-y-6">
              <TaskSteps steps={task.steps} currentStepIndex={0} mode="preview" />
              <button
                onClick={() => setStatus('in-progress')}
                className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Start Task
              </button>
            </div>
          )}

          {status === 'in-progress' && (
            <div className="space-y-6">
              <TaskTimer
                initialSeconds={timeInSeconds}
                onComplete={handleTimerComplete}
                isRunning={true}
              />

              <TaskSteps
                steps={task.steps}
                currentStepIndex={currentStepIndex}
                mode="progress"
              />

              {currentStepIndex === task.steps.length - 1 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="h-10 w-10 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">Upload screenshot</p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>

                  {previewUrl && (
                    <div className="relative">
                      <img
                        src={previewUrl}
                        alt="Screenshot preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                  )}

                  {uploadProgress > 0 && (
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={!selectedFile || isSubmitting}
                    className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Task'}
                  </button>

                  {/* Debug Panel */}
                  {debugInfo && (
                    <DebugPanel
                      request={debugInfo.request}
                      response={debugInfo.response}
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {status === 'completed' && (
            <div className="text-center py-8">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-lg font-medium text-gray-900 mb-2">Task Completed!</h2>
              <p className="text-gray-600">
                {normalizedTask.approvalType === 'automatic'
                  ? 'Your reward has been added to your balance.'
                  : 'Your submission is being reviewed.'}
              </p>
              <button
                onClick={onBack}
                className="mt-6 text-indigo-600 hover:text-indigo-500"
              >
                Return to tasks
              </button>

            
            </div>
          )}
        </div>
      </div>
    </div>
  );
}