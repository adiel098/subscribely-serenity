
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, XCircle, TagIcon, Package } from "lucide-react";

interface SubscriberFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  planFilter: string;
  onPlanFilterChange: (value: string) => void;
  uniquePlans: string[];
}

export const SubscriberFilters = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  planFilter,
  onPlanFilterChange,
  uniquePlans,
}: SubscriberFiltersProps) => {
  return (
    <div className="p-4 bg-white rounded-lg border border-indigo-100 shadow-sm space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium text-indigo-700 mb-2">
        <Filter className="h-4 w-4" />
        <span>Filter Subscribers</span>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-indigo-400" />
          <Input
            placeholder="Search by username or ID..."
            className="pl-9 border-indigo-200 focus:border-indigo-300 focus:ring focus:ring-indigo-100 transition-all"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button 
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-red-500 transition-colors"
            >
              <XCircle className="h-4 w-4" />
            </button>
          )}
        </div>
        
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
          <div className="flex items-center min-w-[130px]">
            <div className="relative">
              <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                <SelectTrigger className="w-full border-indigo-200 focus:ring-indigo-100 bg-white pl-8">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <div className="absolute left-2.5 top-2.5 pointer-events-none">
                  <TagIcon className="h-4 w-4 text-indigo-400" />
                </div>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">🟢 Active</SelectItem>
                  <SelectItem value="inactive">🔴 Inactive</SelectItem>
                  <SelectItem value="removed">⛔ Removed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center min-w-[130px]">
            <div className="relative">
              <Select value={planFilter} onValueChange={onPlanFilterChange}>
                <SelectTrigger className="w-full border-indigo-200 focus:ring-indigo-100 bg-white pl-8">
                  <SelectValue placeholder="Plan" />
                </SelectTrigger>
                <div className="absolute left-2.5 top-2.5 pointer-events-none">
                  <Package className="h-4 w-4 text-indigo-400" />
                </div>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  {uniquePlans.map((plan) => (
                    <SelectItem key={plan} value={plan}>
                      ✨ {plan}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onSearchChange("");
              onStatusFilterChange("all");
              onPlanFilterChange("all");
            }}
            className="ml-2 border-indigo-200 hover:bg-indigo-50 text-indigo-700"
          >
            Reset Filters
          </Button>
        </div>
      </div>
      
      {/* Active filters display */}
      <div className="flex flex-wrap gap-2 pt-1">
        {searchQuery && (
          <div className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-full">
            Search: {searchQuery}
            <XCircle 
              className="h-3.5 w-3.5 text-indigo-400 hover:text-red-500 cursor-pointer" 
              onClick={() => onSearchChange("")}
            />
          </div>
        )}
        
        {statusFilter !== "all" && (
          <div className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-full">
            Status: {statusFilter}
            <XCircle 
              className="h-3.5 w-3.5 text-indigo-400 hover:text-red-500 cursor-pointer" 
              onClick={() => onStatusFilterChange("all")}
            />
          </div>
        )}
        
        {planFilter !== "all" && (
          <div className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-full">
            Plan: {planFilter}
            <XCircle 
              className="h-3.5 w-3.5 text-indigo-400 hover:text-red-500 cursor-pointer" 
              onClick={() => onPlanFilterChange("all")}
            />
          </div>
        )}
      </div>
    </div>
  );
};
