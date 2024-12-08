import React, { useState, useEffect, useRef } from 'react';
import { Search, X, User } from 'lucide-react';

interface UserType {
  id: number;
  name: string;
  email: string;
}

interface UserSearchSelectProps {
  users: UserType[];
  selectedUsers: number[];
  onUserSelect: (userId: number, checked: boolean) => void;
}

export default function UserSearchSelect({ users, selectedUsers, onUserSelect }: UserSearchSelectProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState<UserType[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const handleSearchFocus = () => {
    setIsDropdownOpen(true);
  };

  const handleUserClick = (user: UserType) => {
    if (selectedUsers.includes(user.id)) {
      onUserSelect(user.id, false);
    } else {
      // Clear other selections and select only this user
      selectedUsers.forEach(id => {
        if (id !== user.id) {
          onUserSelect(id, false);
        }
      });
      onUserSelect(user.id, true);
    }
    setSearchQuery('');
    setIsDropdownOpen(false);
  };

  const handleRemoveUser = (userId: number) => {
    onUserSelect(userId, false);
  };

  return (
    <div className="space-y-4">
      {/* Selected Users */}
      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedUsers.map(userId => {
            const user = users.find(u => u.id === userId);
            if (!user) return null;
            
            return (
              <div
                key={userId}
                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full"
              >
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">{user.name}</span>
                <button
                  onClick={() => handleRemoveUser(userId)}
                  className="p-0.5 hover:bg-indigo-100 rounded-full transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Search Input */}
      <div className="relative" ref={dropdownRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={handleSearchFocus}
            placeholder="Search users..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Dropdown */}
        {isDropdownOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-64 overflow-y-auto">
            {filteredUsers.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No users found
              </div>
            ) : (
              <div className="py-1">
                {filteredUsers.map(user => (
                  <button
                    key={user.id}
                    onClick={() => handleUserClick(user)}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 ${
                      selectedUsers.includes(user.id) ? 'bg-indigo-50' : ''
                    }`}
                  >
                    <User className={`h-4 w-4 ${selectedUsers.includes(user.id) ? 'text-indigo-600' : 'text-gray-400'}`} />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {user.name}
                      </div>
                      {user.email && (
                        <div className="text-xs text-gray-500">
                          {user.email}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {selectedUsers.length === 0 && (
        <p className="text-sm text-gray-500 mt-2">
          Search and select a user to send the notification
        </p>
      )}
    </div>
  );
}