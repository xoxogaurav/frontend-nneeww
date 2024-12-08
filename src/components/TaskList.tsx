import React, { useState, useMemo } from 'react';
import TaskCard from './TaskCard';
import { useTasks } from '../db/hooks';
import { Task } from '../db/database';
import TaskSorting, { SortField, SortOrder } from './TaskSorting';

interface TaskListProps {
  onTaskSelect: (task: Task) => void;
  searchQuery: string;
}

export default function TaskList({ onTaskSelect, searchQuery }: TaskListProps) {
  const tasks = useTasks();
  const [sortField, setSortField] = useState<SortField>('reward');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      // Toggle order if same field
      setSortOrder(current => current === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to descending
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sortedAndFilteredTasks = useMemo(() => {
    if (!tasks) return [];

    // First filter
    let filteredTasks = tasks.filter(task => {
      if (!searchQuery) return true;
      
      const searchLower = searchQuery.toLowerCase();
      return (
        task.title.toLowerCase().includes(searchLower) ||
        task.description.toLowerCase().includes(searchLower) ||
        task.category.toLowerCase().includes(searchLower)
      );
    });

    // Then sort
    return filteredTasks.sort((a, b) => {
      const multiplier = sortOrder === 'asc' ? 1 : -1;

      switch (sortField) {
        case 'reward':
          const rewardA = typeof a.reward === 'string' ? parseFloat(a.reward) : a.reward;
          const rewardB = typeof b.reward === 'string' ? parseFloat(b.reward) : b.reward;
          return (rewardA - rewardB) * multiplier;

        case 'createdAt':
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return (dateA - dateB) * multiplier;

        case 'difficulty':
          const difficultyOrder = { Easy: 1, Medium: 2, Hard: 3 };
          return (
            (difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]) * 
            multiplier
          );

        case 'approvalType':
          const approvalA = a.approvalType || a.approval_type;
          const approvalB = b.approvalType || b.approval_type;
          return approvalA.localeCompare(approvalB) * multiplier;

        default:
          return 0;
      }
    });
  }, [tasks, searchQuery, sortField, sortOrder]);

  if (!sortedAndFilteredTasks) return null;

  return (
    <div>
      <TaskSorting
        sortField={sortField}
        sortOrder={sortOrder}
        onSort={handleSort}
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sortedAndFilteredTasks.map((task) => (
          <TaskCard
            key={task.id}
            {...task}
            onClick={() => onTaskSelect(task)}
          />
        ))}
      </div>
    </div>
  );
}