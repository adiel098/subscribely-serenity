
import React, { useState } from "react";
import { 
  Filter, 
  X, 
  Check, 
  Calendar, 
  Users, 
  CreditCard,
  BarChart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";

interface CommunityFiltersBarProps {
  onFilterChange: (filters: CommunityFilters) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export interface CommunityFilters {
  status: string[];
  minRevenue: number | null;
  minSubscribers: number | null;
  dateRange: string | null;
}

export const CommunityFiltersBar: React.FC<CommunityFiltersBarProps> = ({
  onFilterChange,
  onRefresh,
  isLoading
}) => {
  const [filters, setFilters] = useState<CommunityFilters>({
    status: [],
    minRevenue: null,
    minSubscribers: null,
    dateRange: null
  });
  
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isRevenueOpen, setIsRevenueOpen] = useState(false);
  const [isSubscribersOpen, setIsSubscribersOpen] = useState(false);

  const handleStatusChange = (status: string) => {
    const newStatuses = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status];
    
    const newFilters = { ...filters, status: newStatuses };
    setFilters(newFilters);
    updateActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleRevenueChange = (value: string) => {
    const minRevenue = value === "" ? null : Number(value);
    const newFilters = { ...filters, minRevenue };
    setFilters(newFilters);
    updateActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSubscribersChange = (value: string) => {
    const minSubscribers = value === "" ? null : Number(value);
    const newFilters = { ...filters, minSubscribers };
    setFilters(newFilters);
    updateActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleDateRangeChange = (value: string) => {
    const newFilters = { ...filters, dateRange: value };
    setFilters(newFilters);
    updateActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  const updateActiveFilters = (newFilters: CommunityFilters) => {
    const active: string[] = [];
    
    if (newFilters.status.length > 0) {
      active.push("status");
    }
    
    if (newFilters.minRevenue !== null) {
      active.push("revenue");
    }
    
    if (newFilters.minSubscribers !== null) {
      active.push("subscribers");
    }
    
    if (newFilters.dateRange !== null) {
      active.push("date");
    }
    
    setActiveFilters(active);
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      status: [],
      minRevenue: null,
      minSubscribers: null,
      dateRange: null
    };
    setFilters(clearedFilters);
    setActiveFilters([]);
    onFilterChange(clearedFilters);
  };

  const clearFilter = (filter: string) => {
    const newFilters = { ...filters };
    
    switch (filter) {
      case "status":
        newFilters.status = [];
        break;
      case "revenue":
        newFilters.minRevenue = null;
        break;
      case "subscribers":
        newFilters.minSubscribers = null;
        break;
      case "date":
        newFilters.dateRange = null;
        break;
    }
    
    setFilters(newFilters);
    updateActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="flex flex-col gap-2 mb-4">
      <div className="flex items-center justify-between">
        <h3 className="text-md font-medium">Filter Communities</h3>
        {activeFilters.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearAllFilters}
            className="text-indigo-600 hover:text-indigo-700"
          >
            Clear all filters
          </Button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2 items-center">
        {/* Status Filter */}
        <Popover open={isStatusOpen} onOpenChange={setIsStatusOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              className={`border-indigo-100 flex items-center gap-1 ${activeFilters.includes("status") ? "bg-indigo-50" : ""}`}
            >
              <Filter className="h-3.5 w-3.5 text-indigo-600" />
              Status
              {activeFilters.includes("status") && (
                <Badge className="h-4 w-4 p-0 flex items-center justify-center bg-indigo-600 text-white">
                  {filters.status.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-60 p-2" align="start">
            <div className="space-y-2">
              <div className="font-medium text-sm flex items-center justify-between">
                Filter by Status
                {filters.status.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-7 text-xs text-indigo-600"
                    onClick={() => clearFilter("status")}
                  >
                    Clear
                  </Button>
                )}
              </div>
              <Separator />
              <div className="space-y-1 pt-1">
                {["active", "inactive", "suspended"].map((status) => (
                  <div key={status} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`status-${status}`} 
                      checked={filters.status.includes(status)}
                      onCheckedChange={() => handleStatusChange(status)}
                      className="data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                    />
                    <label 
                      htmlFor={`status-${status}`}
                      className="text-sm cursor-pointer capitalize flex items-center"
                    >
                      {status}
                    </label>
                  </div>
                ))}
              </div>
              <div className="flex justify-end pt-2">
                <Button 
                  size="sm"
                  variant="default"
                  className="bg-indigo-600 hover:bg-indigo-700"
                  onClick={() => setIsStatusOpen(false)}
                >
                  Apply
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        {/* Revenue Filter */}
        <Popover open={isRevenueOpen} onOpenChange={setIsRevenueOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              className={`border-indigo-100 flex items-center gap-1 ${activeFilters.includes("revenue") ? "bg-indigo-50" : ""}`}
            >
              <CreditCard className="h-3.5 w-3.5 text-indigo-600" />
              Min Revenue
              {activeFilters.includes("revenue") && (
                <Badge className="h-4 p-1 flex items-center justify-center bg-indigo-600 text-white text-xs">
                  ${filters.minRevenue}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-60 p-2" align="start">
            <div className="space-y-2">
              <div className="font-medium text-sm flex items-center justify-between">
                Minimum Revenue
                {filters.minRevenue !== null && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-7 text-xs text-indigo-600"
                    onClick={() => clearFilter("revenue")}
                  >
                    Clear
                  </Button>
                )}
              </div>
              <Separator />
              <div className="pt-2">
                <Input
                  type="number"
                  placeholder="Enter minimum revenue"
                  value={filters.minRevenue !== null ? filters.minRevenue : ""}
                  onChange={(e) => handleRevenueChange(e.target.value)}
                  className="border-indigo-100"
                />
              </div>
              <div className="flex justify-end pt-2">
                <Button 
                  size="sm"
                  variant="default"
                  className="bg-indigo-600 hover:bg-indigo-700"
                  onClick={() => setIsRevenueOpen(false)}
                >
                  Apply
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        {/* Subscribers Filter */}
        <Popover open={isSubscribersOpen} onOpenChange={setIsSubscribersOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              className={`border-indigo-100 flex items-center gap-1 ${activeFilters.includes("subscribers") ? "bg-indigo-50" : ""}`}
            >
              <Users className="h-3.5 w-3.5 text-indigo-600" />
              Min Subscribers
              {activeFilters.includes("subscribers") && (
                <Badge className="h-4 p-1 flex items-center justify-center bg-indigo-600 text-white text-xs">
                  {filters.minSubscribers}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-60 p-2" align="start">
            <div className="space-y-2">
              <div className="font-medium text-sm flex items-center justify-between">
                Minimum Subscribers
                {filters.minSubscribers !== null && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-7 text-xs text-indigo-600"
                    onClick={() => clearFilter("subscribers")}
                  >
                    Clear
                  </Button>
                )}
              </div>
              <Separator />
              <div className="pt-2">
                <Input
                  type="number"
                  placeholder="Enter minimum subscribers"
                  value={filters.minSubscribers !== null ? filters.minSubscribers : ""}
                  onChange={(e) => handleSubscribersChange(e.target.value)}
                  className="border-indigo-100"
                />
              </div>
              <div className="flex justify-end pt-2">
                <Button 
                  size="sm"
                  variant="default"
                  className="bg-indigo-600 hover:bg-indigo-700"
                  onClick={() => setIsSubscribersOpen(false)}
                >
                  Apply
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        {/* Date Range */}
        <Select 
          onValueChange={handleDateRangeChange}
          value={filters.dateRange || ""}
        >
          <SelectTrigger className={`w-[180px] border-indigo-100 h-9 ${activeFilters.includes("date") ? "bg-indigo-50" : ""}`}>
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-indigo-600" />
              <SelectValue placeholder="Time period" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This week</SelectItem>
            <SelectItem value="month">This month</SelectItem>
            <SelectItem value="quarter">This quarter</SelectItem>
            <SelectItem value="year">This year</SelectItem>
          </SelectContent>
        </Select>
        
        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="flex gap-2 ml-2">
            {activeFilters.map(filter => (
              <Badge 
                key={filter} 
                variant="secondary" 
                className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 gap-1 cursor-pointer"
                onClick={() => clearFilter(filter)}
              >
                {filter === "status" ? `Status (${filters.status.length})` : 
                 filter === "revenue" ? `Min Revenue: $${filters.minRevenue}` :
                 filter === "subscribers" ? `Min Subscribers: ${filters.minSubscribers}` :
                 `Date: ${filters.dateRange}`}
                <X className="h-3 w-3" />
              </Badge>
            ))}
          </div>
        )}
        
        <div className="ml-auto">
          <Button 
            variant="outline" 
            size="sm"
            className="border-indigo-100 hover:bg-indigo-50"
            disabled={isLoading}
            onClick={onRefresh}
          >
            <BarChart className="h-4 w-4 mr-1 text-indigo-600" />
            Run Report
          </Button>
        </div>
      </div>
    </div>
  );
};
