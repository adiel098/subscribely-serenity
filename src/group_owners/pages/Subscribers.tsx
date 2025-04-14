import React, { useState, useCallback, useEffect } from "react";
import { useProjectContext } from "@/contexts/ProjectContext";
import { SubscribersTable } from "@/group_owners/components/subscribers/SubscribersTable";
import { useSubscribers } from "@/group_owners/hooks/useSubscribers";
import { PageHeader } from "@/components/ui/page-header";
import { UserRoundPlus, Users2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CreateSubscriber } from "@/group_owners/components/subscribers/CreateSubscriber";
import { useIsMobile } from "@/hooks/use-mobile";
import { FilterSubscribers } from "@/group_owners/components/subscribers/FilterSubscribers";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";
import { Skeleton } from "@/components/ui/skeleton";
import { NoResults } from "@/components/ui/no-results";

enum SubscriptionStatus {
  ALL = "all",
  ACTIVE = "active",
  INACTIVE = "inactive",
  TRIAL = "trial"
}

const Subscribers = () => {
  const { selectedCommunityId, selectedProjectId, isProjectSelected } = useProjectContext();
  
  const communityId = isProjectSelected ? null : selectedCommunityId;
  const projectId = isProjectSelected ? selectedProjectId : null;
  
  // Choose which hook to use based on what's selected
  const communitySubscribersQuery = useSubscribers(communityId || '');
  const projectSubscribersQuery = useSubscribers(projectId || null);
  
  // Use the appropriate data based on what's selected
  const subscribersQuery = isProjectSelected ? projectSubscribersQuery : communitySubscribersQuery;
  const subscribers = isProjectSelected ? projectSubscribersQuery.data : communitySubscribersQuery.subscribers;
  const isLoading = isProjectSelected ? projectSubscribersQuery.isLoading : communitySubscribersQuery.isLoading;
  
  const [statusFilter, setStatusFilter] = useState<SubscriptionStatus>(SubscriptionStatus.ALL);
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredSubscribers = subscribers?.filter((subscriber) => {
    // Apply status filter
    if (statusFilter === SubscriptionStatus.ACTIVE && subscriber.subscription_status !== "active") {
      return false;
    }
    
    if (statusFilter === SubscriptionStatus.INACTIVE && subscriber.subscription_status !== "inactive") {
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
          icon={<Users2 className="h-6 w-6" />}
        />

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Skeleton className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        ) : subscribers && subscribers.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <FilterSubscribers
                statusFilter={statusFilter}
                onStatusFilterChange={handleStatusFilterChange}
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
              />
              <Button onClick={handleRefresh}>Refresh</Button>
            </div>

            <SubscribersTable
              subscribers={filteredSubscribers || []}
            />
          </div>
        ) : (
          <NoResults />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Subscribers;
