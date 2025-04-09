
import { useState } from "react";
import { useCommunityContext } from "@/contexts/CommunityContext";
import { SubscribersTable } from "@/group_owners/components/subscribers/SubscribersTable";
import { SubscribersFilter } from "@/group_owners/components/subscribers/SubscribersFilter";
import { SubscribersActions } from "@/group_owners/components/subscribers/SubscribersActions";
import { useSubscribers } from "@/group_owners/hooks/useSubscribers";
import { useProjectSubscribers } from "@/group_owners/hooks/dashboard/useProjectSubscribers";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Users, Loader2 } from "lucide-react";
import { EmptySubscribers } from "@/group_owners/components/subscribers/EmptySubscribers";
import { Button } from "@/components/ui/button";

enum SubscriptionStatus {
  ALL = "all",
  ACTIVE = "active",
  INACTIVE = "inactive",
  TRIAL = "trial"
}

const Subscribers = () => {
  const { selectedCommunityId, selectedProjectId, isProjectSelected } = useCommunityContext();
  
  const communityId = isProjectSelected ? null : selectedCommunityId;
  const projectId = isProjectSelected ? selectedProjectId : null;
  
  // Choose which hook to use based on what's selected
  const communitySubscribersQuery = useSubscribers(communityId);
  const projectSubscribersQuery = useProjectSubscribers(projectId);
  
  // Use the appropriate data based on what's selected
  const { data: subscribers, isLoading } = isProjectSelected
    ? projectSubscribersQuery
    : communitySubscribersQuery;
  
  const [statusFilter, setStatusFilter] = useState<SubscriptionStatus>(SubscriptionStatus.ALL);
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredSubscribers = subscribers?.filter((subscriber) => {
    // Apply status filter
    if (statusFilter === SubscriptionStatus.ACTIVE && !subscriber.subscription_status) {
      return false;
    }
    
    if (statusFilter === SubscriptionStatus.INACTIVE && subscriber.subscription_status) {
      return false;
    }
    
    if (statusFilter === SubscriptionStatus.TRIAL && !subscriber.is_trial) {
      return false;
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        subscriber.telegram_user_id?.toLowerCase().includes(query) ||
        subscriber.telegram_username?.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status as SubscriptionStatus);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleRefresh = () => {
    if (isProjectSelected) {
      projectSubscribersQuery.refetch();
    } else {
      communitySubscribersQuery.refetch();
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title={isProjectSelected ? "Project Subscribers" : "Community Subscribers"}
          description="Manage your subscribers and their subscriptions"
          icon={<Users className="h-6 w-6" />}
        />

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        ) : subscribers && subscribers.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <SubscribersFilter
                statusFilter={statusFilter}
                onStatusFilterChange={handleStatusFilterChange}
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
              />
              <SubscribersActions onRefresh={handleRefresh} />
            </div>

            <SubscribersTable
              subscribers={filteredSubscribers || []}
              isProjectSelected={isProjectSelected}
            />
          </div>
        ) : (
          <EmptySubscribers isProjectSelected={isProjectSelected} />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Subscribers;
