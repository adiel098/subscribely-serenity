
import React from 'react';
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SubscribersFilterProps {
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const SubscribersFilter: React.FC<SubscribersFilterProps> = ({
  statusFilter,
  onStatusFilterChange,
  searchQuery,
  onSearchChange
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Search subscribers..."
            className="w-full pl-9"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onStatusFilterChange('all')}
          className={`px-3 py-2 text-sm rounded-md transition-colors ${
            statusFilter === 'all'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        <button
          onClick={() => onStatusFilterChange('active')}
          className={`px-3 py-2 text-sm rounded-md transition-colors ${
            statusFilter === 'active'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Active
        </button>
        <button
          onClick={() => onStatusFilterChange('inactive')}
          className={`px-3 py-2 text-sm rounded-md transition-colors ${
            statusFilter === 'inactive'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Inactive
        </button>
        <button
          onClick={() => onStatusFilterChange('trial')}
          className={`px-3 py-2 text-sm rounded-md transition-colors ${
            statusFilter === 'trial'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Trial
        </button>
      </div>
    </div>
  );
};
