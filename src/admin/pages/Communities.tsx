
import React from "react";
import { useAdminCommunities } from "@/admin/hooks/useAdminCommunities";
import { CommunityHeader } from "@/admin/components/communities/CommunityHeader";
import { CommunityManagementCard } from "@/admin/components/communities/CommunityManagementCard";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function AdminCommunities() {
  const { data: communities, isLoading, isError, refetch } = useAdminCommunities();
  const queryClient = useQueryClient();
  
  const handleRefreshData = async () => {
    try {
      // Refresh community data
      await refetch();
      
      // Trigger the update-community-counts edge function
      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/update-community-counts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      // Invalidate the query to refetch
      queryClient.invalidateQueries({ queryKey: ["admin-communities"] });
      
      toast.success("Community data refreshed successfully");
    } catch (error) {
      toast.error("Failed to refresh community data");
      console.error("Error refreshing community data:", error);
    }
  };

  return (
    <div className="space-y-6">
      <CommunityHeader />
      <CommunityManagementCard 
        communities={communities}
        isLoading={isLoading}
        isError={isError}
        refetch={handleRefreshData}
      />
    </div>
  );
}
