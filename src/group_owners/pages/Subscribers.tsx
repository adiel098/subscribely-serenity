import { useState } from "react";
import { DashboardLayout } from "@/group_owners/components/DashboardLayout";
import { SearchBar } from "@/components/subscribers/SearchBar";
import { SubscribersHeader } from "@/components/subscribers/SubscribersHeader";
import { SubscribersTable } from "@/components/subscribers/SubscribersTable";
import { StatusFilter } from "@/components/subscribers/StatusFilter";
import { PlanFilter } from "@/components/subscribers/PlanFilter";
import { useSubscriberManagement } from "@/group_owners/hooks/useSubscriberManagement";
import { EditSubscriberDialog } from "@/components/subscribers/EditSubscriberDialog";
import { useCommunityContext } from "@/contexts/CommunityContext";

const Subscribers = () => {
  const { selectedCommunityId } = useCommunityContext();
  const {
    subscribers,
    isLoading,
    selectedSubscriber,
    setSelectedSubscriber,
    editDialogOpen,
    setEditDialogOpen,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    planFilter,
    setPlanFilter,
    isUpdating,
    uniquePlans,
    handleUpdateStatus,
    handleRemoveSubscriber,
    handleExport,
    refetch,
  } = useSubscriberManagement(selectedCommunityId || "");

  const handleEditSubscriber = (subscriber: any) => {
    setSelectedSubscriber(subscriber);
    setEditDialogOpen(true);
  };

  const handleRemove = (subscriber: any) => {
    handleRemoveSubscriber(subscriber);
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <SubscribersHeader
          onUpdateStatus={handleUpdateStatus}
          onExport={handleExport}
          isUpdating={isUpdating}
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
            <StatusFilter
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
            />
            <PlanFilter
              planFilter={planFilter}
              uniquePlans={uniquePlans}
              onPlanFilterChange={setPlanFilter}
            />
          </div>
        </div>
        <SubscribersTable
          subscribers={subscribers}
          onEdit={handleEditSubscriber}
          onRemove={handleRemove}
        />
      </div>
      <EditSubscriberDialog
        subscriber={selectedSubscriber}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={refetch}
      />
    </DashboardLayout>
  );
};

export default Subscribers;
