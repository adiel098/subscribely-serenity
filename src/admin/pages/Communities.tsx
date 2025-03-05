
import React from "react";
import { useAdminCommunities } from "@/admin/hooks/useAdminCommunities";
import { CommunityHeader } from "@/admin/components/communities/CommunityHeader";
import { CommunityManagementCard } from "@/admin/components/communities/CommunityManagementCard";

export default function AdminCommunities() {
  const { data: communities, isLoading, isError, refetch } = useAdminCommunities();

  console.log("Rendering communities:", communities);

  return (
    <div className="space-y-6">
      <CommunityHeader />
      <CommunityManagementCard 
        communities={communities}
        isLoading={isLoading}
        isError={isError}
        refetch={refetch}
      />
    </div>
  );
}
