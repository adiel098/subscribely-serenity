
import { useCommunityContext } from "@/contexts/CommunityContext";
import { Loader2 } from "lucide-react";
import { EditSubscriberDialog } from "@/components/subscribers/EditSubscriberDialog";
import { SubscribersTable } from "@/components/subscribers/SubscribersTable";
import { SearchBar } from "@/components/subscribers/SearchBar";
import { StatusFilter } from "@/components/subscribers/StatusFilter";
import { PlanFilter } from "@/components/subscribers/PlanFilter";
import { SubscribersHeader } from "@/components/subscribers/SubscribersHeader";
import { useSubscriberManagement } from "@/hooks/useSubscriberManagement";

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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Loading subscribers...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SubscribersHeader
        onUpdateStatus={handleUpdateStatus}
        onExport={handleExport}
        isUpdating={isUpdating}
      />

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

      <SubscribersTable 
        subscribers={subscribers}
        onEdit={(subscriber) => {
          setSelectedSubscriber(subscriber);
          setEditDialogOpen(true);
        }}
        onRemove={handleRemoveSubscriber}
      />

      {selectedSubscriber && (
        <EditSubscriberDialog
          subscriber={selectedSubscriber}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSuccess={refetch}
        />
      )}
    </div>
  );
};

export default Subscribers;
