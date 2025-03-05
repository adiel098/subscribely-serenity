
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, RefreshCw } from "lucide-react";

interface CommunitySearchBarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  handleRefresh: () => void;
  isRefreshing: boolean;
}

export const CommunitySearchBar: React.FC<CommunitySearchBarProps> = ({
  searchTerm,
  setSearchTerm,
  handleRefresh,
  isRefreshing,
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="relative w-96">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or owner..."
          className="pl-8 w-full border-indigo-100"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <Button variant="outline" className="border-indigo-100 flex items-center gap-2">
          <Filter className="h-4 w-4 text-indigo-600" />
          Filter
        </Button>
        <Button 
          variant="outline" 
          className="border-indigo-100 flex items-center gap-2" 
          onClick={handleRefresh} 
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 text-indigo-600 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>
    </div>
  );
};
