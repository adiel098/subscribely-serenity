import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, XCircle, TagIcon, Package, Download } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

interface SubscriberFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: "all" | "active" | "inactive";
  onStatusFilterChange: (value: "all" | "active" | "inactive") => void;
  planFilter: string | null;
  onPlanFilterChange: (value: string | null) => void;
  uniquePlans: any[];
  onExport: () => void;
}

export const SubscriberFilters = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  planFilter,
  onPlanFilterChange,
  uniquePlans,
  onExport
}: SubscriberFiltersProps) => {
  const isMobile = useIsMobile();
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const hasActiveFilters = statusFilter !== "all" || planFilter !== null;

  const FilterContent = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3">
        <div className="space-y-2">
          <label className="text-xs font-medium flex items-center gap-1.5">
            <TagIcon className="h-3.5 w-3.5 text-gray-500" />
            Status
          </label>
          <Select 
            value={statusFilter} 
            onValueChange={(value: "all" | "active" | "inactive") => onStatusFilterChange(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium flex items-center gap-1.5">
            <Package className="h-3.5 w-3.5 text-gray-500" />
            Plan
          </label>
          <Select
            value={planFilter || "all"}
            onValueChange={(value) => onPlanFilterChange(value === "all" ? null : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All plans" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All plans</SelectItem>
              {uniquePlans.map((plan) => (
                <SelectItem key={plan.id} value={plan.id}>
                  {plan.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search subscribers..." 
              className="pl-9 h-9 text-sm" 
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
          
          <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className={`px-2.5 h-9 ${hasActiveFilters ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : ''}`}
              >
                <Filter className="h-4 w-4" />
                {hasActiveFilters && (
                  <span className="ml-1.5 text-xs bg-indigo-200 text-indigo-700 px-1.5 rounded-full">
                    {(statusFilter !== "all" ? 1 : 0) + (planFilter !== null ? 1 : 0)}
                  </span>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent 
              className="sm:max-w-[425px] mx-4 rounded-xl shadow-[0_0_30px_10px_rgba(0,0,0,0.06)] animate-in fade-in-0 zoom-in-95 duration-200"
              style={{
                animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <DialogHeader className="pb-2">
                <DialogTitle className="flex items-center gap-2 text-base">
                  <Filter className="h-4 w-4" />
                  Filter Subscribers
                </DialogTitle>
              </DialogHeader>
              <div className="overflow-y-auto max-h-[80vh]">
                <FilterContent />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
        <Filter className="h-4 w-4" />
        <span>Filter Subscribers</span>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
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
        
        <div className="grid grid-cols-4 gap-3 w-full sm:w-auto">
          <div className="col-span-2">
            <div className="relative">
              <Select 
                value={statusFilter} 
                onValueChange={(value: "all" | "active" | "inactive") => onStatusFilterChange(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="col-span-2">
            <Select
              value={planFilter || "all"}
              onValueChange={(value) => onPlanFilterChange(value === "all" ? null : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All plans" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All plans</SelectItem>
                {uniquePlans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};
