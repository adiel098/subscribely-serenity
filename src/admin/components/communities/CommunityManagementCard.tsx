import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe } from "lucide-react";
import { CommunitySearchBar } from "./CommunitySearchBar";
import { CommunitiesTable } from "./CommunitiesTable";
import { CommunityFiltersBar, CommunityFilters } from "./CommunityFiltersBar";
import { AdminCommunity } from "@/admin/hooks/useAdminCommunities";
import { toast } from "sonner";

interface CommunityManagementCardProps {
  communities: AdminCommunity[] | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<any>;
}

export const CommunityManagementCard: React.FC<CommunityManagementCardProps> = ({
  communities,
  isLoading,
  isError,
  refetch
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filteredCommunities, setFilteredCommunities] = useState<AdminCommunity[]>([]);
  const [filters, setFilters] = useState<CommunityFilters>({
    status: [],
    minRevenue: null,
    minSubscribers: null,
    dateRange: null
  });
  const [sortColumn, setSortColumn] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    if (communities) {
      let filtered = [...communities];
      
      // Apply search filter
      if (searchTerm) {
        filtered = filtered.filter(
          community => 
            community.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            (community.owner_name && community.owner_name.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }
      
      // Apply status filter
      if (filters.status.length > 0) {
        filtered = filtered.filter(community => 
          filters.status.includes(community.status)
        );
      }
      
      // Apply revenue filter
      if (filters.minRevenue !== null) {
        filtered = filtered.filter(community => 
          community.revenue >= filters.minRevenue!
        );
      }
      
      // Apply subscribers filter
      if (filters.minSubscribers !== null) {
        filtered = filtered.filter(community => 
          community.subscriptions >= filters.minSubscribers!
        );
      }
      
      // Apply sorting
      filtered.sort((a, b) => {
        let valueA, valueB;
        
        switch (sortColumn) {
          case 'name':
            valueA = a.name.toLowerCase();
            valueB = b.name.toLowerCase();
            break;
          case 'owner':
            valueA = (a.owner_name || '').toLowerCase();
            valueB = (b.owner_name || '').toLowerCase();
            break;
          case 'subscriptions':
            valueA = a.subscriptions;
            valueB = b.subscriptions;
            break;
          case 'revenue':
            valueA = a.revenue;
            valueB = b.revenue;
            break;
          case 'status':
            valueA = a.status;
            valueB = b.status;
            break;
          default:
            valueA = a.name.toLowerCase();
            valueB = b.name.toLowerCase();
        }
        
        if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
        if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
      
      setFilteredCommunities(filtered);
    }
  }, [communities, searchTerm, filters, sortColumn, sortDirection]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast.success("Communities data refreshed successfully");
    } catch (error) {
      toast.error("Failed to refresh data");
      console.error("Refresh error:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleFilterChange = (newFilters: CommunityFilters) => {
    setFilters(newFilters);
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      // Toggle direction if clicking the same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New column, default to ascending
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const runReport = () => {
    handleRefresh();
    toast.success("Generating report based on current filters...");
  };

  return (
    <Card className="border-indigo-100 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Globe className="h-5 w-5 text-indigo-600" />
          <span>Community Management</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <CommunitySearchBar 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
        
        <CommunityFiltersBar
          onFilterChange={handleFilterChange}
          onRefresh={runReport}
          isLoading={isRefreshing}
        />
        
        <CommunitiesTable 
          communities={filteredCommunities}
          isLoading={isLoading || isRefreshing}
          isError={isError}
          onSort={handleSort}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
        />
      </CardContent>
    </Card>
  );
};
