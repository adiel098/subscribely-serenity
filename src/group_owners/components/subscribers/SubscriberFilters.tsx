
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, XCircle, TagIcon, Package, Download } from "lucide-react";

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
  return <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
        <Filter className="h-4 w-4" />
        <span>Filter Subscribers</span>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input placeholder="Search by username or ID..." className="pl-9" value={searchQuery} onChange={e => onSearchChange(e.target.value)} />
          {searchQuery && <button onClick={() => onSearchChange("")} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition-colors">
              <XCircle className="h-4 w-4" />
            </button>}
        </div>
        
        <div className="grid grid-cols-4 gap-3 w-full sm:w-auto">
          <div className="col-span-1 w-full">
            <div className="relative">
              <Select 
                value={statusFilter} 
                onValueChange={(value: "all" | "active" | "inactive") => onStatusFilterChange(value)}
              >
                <SelectTrigger className="w-full pl-8">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <div className="absolute left-2.5 top-2.5 pointer-events-none">
                  <TagIcon className="h-4 w-4 text-gray-400" />
                </div>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="col-span-1 w-full">
            <div className="relative">
              <Select 
                value={planFilter || "all"} 
                onValueChange={(value) => onPlanFilterChange(value === "all" ? null : value)}
              >
                <SelectTrigger className="w-full pl-8">
                  <SelectValue placeholder="Plan" />
                </SelectTrigger>
                <div className="absolute left-2.5 top-2.5 pointer-events-none">
                  <Package className="h-4 w-4 text-gray-400" />
                </div>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  {uniquePlans.map(plan => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name}
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
              onPlanFilterChange(null);
            }} 
            className="col-span-1 w-full h-10"
          >
            Reset
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onExport} 
            className="col-span-1 w-full h-10 bg-green-50/80 hover:bg-green-100/90 border-green-200"
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      
      {/* Active filters display */}
      <div className="flex flex-wrap gap-2 pt-1">
        {searchQuery && <div className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
            Search: {searchQuery}
            <XCircle className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600 cursor-pointer" onClick={() => onSearchChange("")} />
          </div>}
        
        {statusFilter !== "all" && <div className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
            Status: {statusFilter}
            <XCircle className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600 cursor-pointer" onClick={() => onStatusFilterChange("all")} />
          </div>}
        
        {planFilter !== null && <div className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
            Plan: {uniquePlans.find(p => p.id === planFilter)?.name || planFilter}
            <XCircle className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600 cursor-pointer" onClick={() => onPlanFilterChange(null)} />
          </div>}
      </div>
    </div>;
};
