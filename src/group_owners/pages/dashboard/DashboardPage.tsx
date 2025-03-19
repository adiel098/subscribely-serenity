
import React, { useEffect } from "react";
import { DashboardLayout } from "@/group_owners/components/DashboardLayout";
import Dashboard from "@/group_owners/pages/Dashboard";
import { useCommunities } from "@/group_owners/hooks/useCommunities";
import { useCommunityGroups } from "@/group_owners/hooks/useCommunityGroups";
import { useNavigate } from "react-router-dom";

const DashboardPage: React.FC = () => {
  const { data: communities, isLoading: communitiesLoading } = useCommunities();
  const { data: groups, isLoading: groupsLoading } = useCommunityGroups();
  const navigate = useNavigate();

  useEffect(() => {
    // Only check after data is loaded
    if (!communitiesLoading && !groupsLoading) {
      const hasCommunities = communities && communities.length > 0;
      const hasGroups = groups && groups.length > 0;

      // If user has no communities and no groups, redirect to onboarding
      if (!hasCommunities && !hasGroups) {
        console.log("No communities or groups found in DashboardPage - redirecting to onboarding");
        navigate('/onboarding', { replace: true });
      }
    }
  }, [communities, groups, communitiesLoading, groupsLoading, navigate]);

  // If still loading, render the dashboard normally and let it handle loading states
  return (
    <DashboardLayout>
      <Dashboard />
    </DashboardLayout>
  );
};

export default DashboardPage;
