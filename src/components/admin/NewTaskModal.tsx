import React, { useState } from 'react';
import { X } from 'lucide-react';
import { AdminService } from '../../services';
import CountrySelector from './CountrySelector';
import toast from 'react-hot-toast';
import DebugPanel from '../DebugPanel';

interface NewTaskModalProps {
  onClose: () => void;
  onTaskCreated: (task: any) => void;
}

export default function NewTaskModal({
  onClose,
  onTaskCreated,
}: NewTaskModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    reward: '',
    time_estimate: '',
    category: '',
    difficulty: 'Easy' as 'Easy' | 'Medium' | 'Hard',
    time_in_seconds: '',
    steps: [''],
    approval_type: 'manual' as 'automatic' | 'manual',
    allowed_countries: ['IN'],
    hourly_limit: '0',
    daily_limit: '0',
    total_submission_limit: '0',
    daily_submission_limit: '0',
    is_active: true,
    one_off: true,
  });

  const handleAddStep = () => {
    setFormData((prev) => ({
      ...prev,
      steps: [...prev.steps, ''],
    }));
  };

  const handleStepChange = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      steps: prev.steps.map((step, i) => (i === index ? value : step)),
    }));
  };

  const handleRemoveStep = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index),
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleCountryChange = (selected: string[]) => {
    setFormData((prev) => ({
      ...prev,
      allowed_countries: selected,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const taskData = {
        title: formData.title,
        description: formData.description,
        reward: parseFloat(formData.reward),
        time_estimate: formData.time_estimate,
        category: formData.category,
        difficulty: formData.difficulty,
        time_in_seconds: parseInt(formData.time_in_seconds),
        steps: formData.steps.filter((step) => step.trim() !== ''),
        approval_type: formData.approval_type,
        allowed_countries: formData.allowed_countries,
        hourly_limit: parseInt(formData.hourly_limit),
        daily_limit: parseInt(formData.daily_limit),
        total_submission_limit: parseInt(formData.total_submission_limit),
        daily_submission_limit: parseInt(formData.daily_submission_limit),
        is_active: formData.is_active,
        one_off: formData.one_off,
      };

      setDebugInfo({
        request: {
          method: 'POST',
          url: '/tasks',
          data: taskData,
        },
      });

      const newTask = await AdminService.createTask(taskData);

      setDebugInfo((prev) => ({
        ...prev,
        response: {
          status: 200,
          data: newTask,
        },
      }));

      toast.success('Task created successfully');
      onTaskCreated(newTask);
      onClose();
    } catch (error) {
      console.error('Error creating task:', error);

      setDebugInfo((prev) => ({
        ...prev,
        response: {
          status: error.response?.status || 500,
          error: error.message,
          data: error.response?.data,
        },
      }));

      toast.error(
        error instanceof Error ? error.message : 'Failed to create task'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Create New Task
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              required
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Reward ($)
              </label>
              <input
                type="number"
                name="reward"
                required
                min="0"
                step="0.01"
                value={formData.reward}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Time Estimate
              </label>
              <input
                type="text"
                name="time_estimate"
                required
                placeholder="e.g., 30 minutes"
                value={formData.time_estimate}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <input
                type="text"
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Time in Seconds
              </label>
              <input
                type="number"
                name="time_in_seconds"
                required
                min="0"
                value={formData.time_in_seconds}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Difficulty
              </label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Approval Type
              </label>
              <select
                name="approval_type"
                value={formData.approval_type}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="automatic">Automatic</option>
                <option value="manual">Manual</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Hourly Per User Limit
              </label>
              <input
                type="number"
                name="hourly_limit"
                min="0"
                value={formData.hourly_limit}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Daily Per User Limit
              </label>
              <input
                type="number"
                name="daily_limit"
                min="0"
                value={formData.daily_limit}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Total Task Submission Limit
              </label>
              <input
                type="number"
                name="total_submission_limit"
                min="0"
                value={formData.total_submission_limit}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="0 for unlimited"
              />
              <p className="mt-1 text-sm text-gray-500">
                Set to 0 for unlimited submissions
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Daily Task Submission Limit
              </label>
              <input
                type="number"
                name="daily_submission_limit"
                min="0"
                value={formData.daily_submission_limit}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="0 for unlimited"
              />
              <p className="mt-1 text-sm text-gray-500">
                Set to 0 for unlimited submissions
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Allowed Countries
            </label>
            <CountrySelector
              availableCountries={[]}
              selectedCountries={formData.allowed_countries}
              onChange={handleCountryChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Steps
            </label>
            {formData.steps.map((step, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={step}
                  onChange={(e) => handleStepChange(index, e.target.value)}
                  placeholder={`Step ${index + 1}`}
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2"
                />
                {formData.steps.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveStep(index)}
                    className="px-3 py-2 text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddStep}
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              Add Step
            </button>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="one_off"
              name="one_off"
              checked={formData.one_off}
              onChange={handleChange}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
            />
            <label htmlFor="one_off" className="ml-2 text-sm text-gray-700">
              One Time
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
            />
            <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
              Active
            </label>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700 disabled:bg-indigo-400"
            >
              {isSubmitting ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>

        {debugInfo && (
          <DebugPanel
            request={debugInfo.request}
            response={debugInfo.response}
          />
        )}
      </div>
    </div>
  );
}