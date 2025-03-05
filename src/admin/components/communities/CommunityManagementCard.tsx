
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe } from "lucide-react";
import { CommunitySearchBar } from "./CommunitySearchBar";
import { CommunitiesTable } from "./CommunitiesTable";
import { AdminCommunity } from "@/admin/hooks/useAdminCommunities";

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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const filteredCommunities = communities?.filter(
    community => community.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                community.owner_name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

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
          handleRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />
        <CommunitiesTable 
          communities={filteredCommunities}
          isLoading={isLoading}
          isError={isError}
        />
      </CardContent>
    </Card>
  );
};
