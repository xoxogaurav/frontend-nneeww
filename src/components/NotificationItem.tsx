import React from 'react';
import { CheckCircle, Info, AlertTriangle, XCircle } from 'lucide-react';

interface NotificationItemProps {
  id: number;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  isRead: boolean;
  createdAt: Date;
  onMarkAsRead: (id: number) => void;
}

export default function NotificationItem({
  id,
  title,
  message,
  type,
  isRead,
  createdAt,
  onMarkAsRead
}: NotificationItemProps) {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const handleClick = () => {
    if (!isRead) {
      onMarkAsRead(id);
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    }
    
    return date.toLocaleDateString();
  };

  return (
    <div
      className={`p-4 cursor-pointer transition-colors duration-200 ${
        !isRead ? 'bg-indigo-50 hover:bg-indigo-100' : 'hover:bg-gray-50'
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">{getIcon()}</div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium text-gray-900">{title}</p>
          <p className="mt-1 text-sm text-gray-500">{message}</p>
          <p className="mt-1 text-xs text-gray-400">
            {formatTimeAgo(new Date(createdAt))}
          </p>
        </div>
      </div>
    </div>
  );
}