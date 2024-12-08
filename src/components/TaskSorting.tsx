import React from 'react';
import { ArrowUpDown } from 'lucide-react';

export type SortField = 'reward' | 'createdAt' | 'difficulty' | 'approvalType';
export type SortOrder = 'asc' | 'desc';

interface TaskSortingProps {
  sortField: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;
}

export default function TaskSorting({ sortField, sortOrder, onSort }: TaskSortingProps) {
  const sortOptions: { field: SortField; label: string }[] = [
    { field: 'reward', label: 'Price' },
    { field: 'createdAt', label: 'Date' },
    { field: 'difficulty', label: 'Difficulty' },
    { field: 'approvalType', label: 'Approval Type' }
  ];

  return (
    <div className="flex items-center space-x-4 mb-6">
      <ArrowUpDown className="h-5 w-5 text-gray-400" />
      <div className="flex flex-wrap gap-2">
        {sortOptions.map(({ field, label }) => (
          <button
            key={field}
            onClick={() => onSort(field)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg flex items-center gap-1
              ${sortField === field
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
          >
            {label}
            {sortField === field && (
              <span className="text-xs ml-1">
                ({sortOrder === 'asc' ? '↑' : '↓'})
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}