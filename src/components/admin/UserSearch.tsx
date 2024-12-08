import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
}

interface UserSearchProps {
  users: User[];
  selectedUsers: number[];
  onUserSelect: (userId: number, checked: boolean) => void;
}

export default function UserSearch({ users, selectedUsers, onUserSelect }: UserSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>(users);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredUsers(
        users.filter(user => 
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, users]);

  const handleRemoveUser = (userId: number) => {
    onUserSelect(userId, false);
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search users..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* Selected Users */}
      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 border border-gray-200 rounded-md bg-gray-50">
          {selectedUsers.map(userId => {
            const user = users.find(u => u.id === userId);
            if (!user) return null;
            
            return (
              <div
                key={userId}
                className="flex items-center gap-1 px-2 py-1 bg-white rounded-full border border-gray-200 text-sm"
              >
                <span>{user.name}</span>
                <button
                  onClick={() => handleRemoveUser(userId)}
                  className="p-0.5 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-3 w-3 text-gray-500" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* User List */}
      <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
        {filteredUsers.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No users found
          </div>
        ) : (
          filteredUsers.map(user => (
            <label
              key={user.id}
              className="flex items-center p-2 hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedUsers.includes(user.id)}
                onChange={(e) => onUserSelect(user.id, e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">{user.name}</span>
              {user.email && (
                <span className="ml-2 text-xs text-gray-500">({user.email})</span>
              )}
            </label>
          ))
        )}
      </div>
    </div>
  );
}