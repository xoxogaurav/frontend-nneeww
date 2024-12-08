import React, { useState } from 'react';
import { Task } from '../../db/database';
import { Clock, DollarSign, Tag, Zap, UserCheck, Edit, Trash } from 'lucide-react';
import EditTaskModal from './EditTaskModal';
import toast from 'react-hot-toast';

interface AdminTaskListProps {
  tasks: Task[];
  onTaskUpdated?: () => void;
  onDeleteTask?: (taskId: number) => void;
}

export default function AdminTaskList({ tasks, onTaskUpdated, onDeleteTask }: AdminTaskListProps) {
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  if (!tasks?.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        No tasks available
      </div>
    );
  }

  const handleTaskUpdated = (updatedTask: Task) => {
    setEditingTask(null);
    if (onTaskUpdated) {
      onTaskUpdated();
    }
  };

  return (
    <>
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {tasks.map((task) => (
          <div key={task.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
              <span className="flex items-center text-lg font-bold text-indigo-600">
                <DollarSign className="h-5 w-5 mr-1" />
                {typeof task.reward === 'string' ? parseFloat(task.reward).toFixed(2) : task.reward.toFixed(2)}
              </span>
            </div>
            
            <p className="text-gray-600 mb-4">{task.description}</p>
            
            <div className="flex flex-wrap gap-2 items-center mb-4">
              <span className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                {task.timeEstimate}
              </span>
              <span className="flex items-center text-sm text-gray-500">
                <Tag className="h-4 w-4 mr-1" />
                {task.category}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                task.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                task.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {task.difficulty}
              </span>
              <span className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                task.approval_type === 'automatic' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-purple-100 text-purple-800'
              }`}>
                {task.approval_type === 'automatic' ? (
                  <><Zap className="h-3 w-3 mr-1" /> Instant</>
                ) : (
                  <><UserCheck className="h-3 w-3 mr-1" /> Manual</>
                )}
              </span>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setEditingTask(task)}
                className="flex items-center px-3 py-1 text-sm text-indigo-600 hover:text-indigo-700"
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </button>
              {onDeleteTask && (
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this task?')) {
                      onDeleteTask(task.id!);
                    }
                  }}
                  className="flex items-center px-3 py-1 text-sm text-red-600 hover:text-red-700"
                >
                  <Trash className="h-4 w-4 mr-1" />
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {editingTask && (
        <EditTaskModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onTaskUpdated={handleTaskUpdated}
        />
      )}
    </>
  );
}