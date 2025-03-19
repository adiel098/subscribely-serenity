import React from "react";
import { DashboardLayout } from "@/group_owners/components/DashboardLayout";
import Dashboard from "@/group_owners/pages/Dashboard";
import { useCommunities } from "@/group_owners/hooks/useCommunities";
import { useCommunityGroups } from "@/group_owners/hooks/useCommunityGroups";

const DashboardPage: React.FC = () => {
  const { data: communities, isLoading: communitiesLoading } = useCommunities();
  const { data: groups, isLoading: groupsLoading } = useCommunityGroups();

  return (
    <DashboardLayout>
      <Dashboard />
    </DashboardLayout>
  );
};

export default DashboardPage;
