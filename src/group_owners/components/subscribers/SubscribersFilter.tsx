
import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, XCircle } from "lucide-react";

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
      <div className="relative flex-grow">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <Input 
          placeholder="Search by username or ID..." 
          className="pl-9" 
          value={searchQuery} 
          onChange={e => onSearchChange(e.target.value)} 
        />
        {searchQuery && (
          <button 
            onClick={() => onSearchChange("")} 
            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XCircle className="h-4 w-4" />
          </button>
        )}
      </div>
      
      <div className="w-full sm:w-48">
        <Select 
          value={statusFilter} 
          onValueChange={(value) => onStatusFilterChange(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="trial">Trial</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
