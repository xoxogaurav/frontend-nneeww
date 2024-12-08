import React, { useState } from 'react';
import { X } from 'lucide-react';
import AdvertiserService from '../../services/advertiser';
import CountrySelector from '../admin/CountrySelector';
import toast from 'react-hot-toast';
import DebugPanel from '../DebugPanel';

interface NewAdvertiserTaskModalProps {
  onClose: () => void;
  onTaskCreated: (task: any) => void;
}

export default function NewAdvertiserTaskModal({ onClose, onTaskCreated }: NewAdvertiserTaskModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    reward: '',
    total_budget: '',
    time_estimate: '',
    category: '',
    difficulty: 'Easy' as 'Easy' | 'Medium' | 'Hard',
    time_in_seconds: '',
    steps: [''],
    approval_type: 'manual' as 'automatic' | 'manual',
    allowed_countries: ['US', 'UK', 'CA'],
    cooldown_timer: '0',
    total_submission_limit: '0',
    daily_submission_limit: '0',
    is_active: true
  });

  const handleAddStep = () => {
    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, '']
    }));
  };

  const handleStepChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.map((step, i) => i === index ? value : step)
    }));
  };

  const handleRemoveStep = (index: number) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index)
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleCountryChange = (selected: string[]) => {
    setFormData(prev => ({
      ...prev,
      allowed_countries: selected
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
        total_budget: parseFloat(formData.total_budget),
        time_estimate: formData.time_estimate,
        category: formData.category,
        difficulty: formData.difficulty,
        time_in_seconds: parseInt(formData.time_in_seconds),
        steps: formData.steps.filter(step => step.trim() !== ''),
        approval_type: formData.approval_type,
        allowed_countries: formData.allowed_countries,
        cooldown_timer: parseInt(formData.cooldown_timer),
        total_submission_limit: parseInt(formData.total_submission_limit),
        daily_submission_limit: parseInt(formData.daily_submission_limit),
        is_active: formData.is_active
      };

      setDebugInfo({
        request: {
          method: 'POST',
          url: '/advertiser/tasks',
          data: taskData
        }
      });

      const newTask = await AdvertiserService.createTask(taskData);

      setDebugInfo(prev => ({
        ...prev,
        response: {
          status: 200,
          data: newTask
        }
      }));

      toast.success('Campaign created successfully');
      onTaskCreated(newTask);
      onClose();
    } catch (error: any) {
      console.error('Error creating task:', error);
      
      setDebugInfo(prev => ({
        ...prev,
        response: {
          status: error.response?.status || 500,
          error: error.message,
          data: error.response?.data
        }
      }));

      toast.error(error.message || 'Failed to create campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create New Campaign</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
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
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Reward per Task ($)</label>
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
              <label className="block text-sm font-medium text-gray-700">Total Budget ($)</label>
              <input
                type="number"
                name="total_budget"
                required
                min="0"
                step="0.01"
                value={formData.total_budget}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
              <p className="mt-1 text-xs text-gray-500">
                Campaign will automatically pause when budget is depleted
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
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
              <label className="block text-sm font-medium text-gray-700">Difficulty</label>
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
              <label className="block text-sm font-medium text-gray-700">Time Estimate</label>
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
              <label className="block text-sm font-medium text-gray-700">Time in Seconds</label>
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

            <div>
              <label className="block text-sm font-medium text-gray-700">Cooldown Timer (hours)</label>
              <input
                type="number"
                name="cooldown_timer"
                min="0"
                value={formData.cooldown_timer}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter 0 for single submission per user 
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Approval Type</label>
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
              <label className="block text-sm font-medium text-gray-700">Daily Submission Limit</label>
              <input
                type="number"
                name="daily_submission_limit"
                min="0"
                value={formData.daily_submission_limit}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter 0 for unlimited daily submissions
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Total Submission Limit</label>
              <input
                type="number"
                name="total_submission_limit"
                min="0"
                value={formData.total_submission_limit}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter 0 for unlimited total submissions
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Allowed Countries</label>
            <CountrySelector
              availableCountries={[]}
              selectedCountries={formData.allowed_countries}
              onChange={handleCountryChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Steps</label>
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
              {isSubmitting ? 'Creating...' : 'Create Campaign'}
            </button>
          </div>
        </form>

        <DebugPanel
          request={debugInfo?.request}
          response={debugInfo?.response}
        />
      </div>
    </div>
  );
}