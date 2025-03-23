
import { useToast } from "@/components/ui/use-toast";
import { useCommunityContext } from "@/contexts/CommunityContext";
import { SubscribersTable } from "@/group_owners/components/subscribers/SubscribersTable";
import { SubscriberFilters } from "../components/subscribers/SubscriberFilters";
import { useSubscriberFilters } from "../hooks/useSubscriberFilters";
import { useSubscriberPageState } from "../hooks/useSubscriberPageState";
import { SubscribersLoading } from "../components/subscribers/SubscribersLoading";
import { SubscribersHeaderSection } from "../components/subscribers/SubscribersHeaderSection";
import { SubscribersCountDisplay } from "../components/subscribers/SubscribersCountDisplay";
import { SubscriberDialogs } from "../components/subscribers/SubscriberDialogs";
import { exportSubscribersToCSV } from "../utils/exportSubscribers";
import { SubscriberTabs } from "../components/subscribers/SubscriberTabs";
import { useState } from "react";
import { AssignPlanDialog } from "../components/subscribers/AssignPlanDialog";
import { Subscriber } from "../hooks/useSubscribers";

const Subscribers = () => {
  const { selectedCommunityId, selectedGroupId, isGroupSelected } = useCommunityContext();
  const { toast } = useToast();
  const entityId = isGroupSelected ? selectedGroupId : selectedCommunityId;
  
  const [userToAssignPlan, setUserToAssignPlan] = useState<Subscriber | null>(null);
  const [assignPlanDialogOpen, setAssignPlanDialogOpen] = useState(false);
  
  const {
    subscribers,
    isLoading,
    isUpdating,
    refetch,
    selectedSubscriber,
    setSelectedSubscriber,
    editDialogOpen,
    setEditDialogOpen,
    removeDialogOpen,
    unblockDialogOpen,
    subscriberToRemove,
    subscriberToUnblock,
    isRemoving,
    isUnblocking,
    onRemoveClick,
    onUnblockClick,
    onConfirmRemove,
    onConfirmUnblock,
    handleRemoveDialogChange,
    handleUnblockDialogChange,
    assignPlanToUser
  } = useSubscriberPageState(entityId || "");

  const {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    planFilter,
    setPlanFilter,
    filteredSubscribers,
    managedSubscribers,
    unmanagedUsers,
    uniquePlans
  } = useSubscriberFilters(subscribers);

  const handleExport = () => {
    const success = exportSubscribersToCSV(filteredSubscribers);
    if (success) {
      toast({
        title: "Success",
        description: "Subscribers data exported successfully",
      });
    }
  };

  const handleAssignPlan = (user: Subscriber) => {
    setUserToAssignPlan(user);
    setAssignPlanDialogOpen(true);
  };

  const handleAssignPlanSubmit = async (userId: string, planId: string, endDate: Date) => {
    await assignPlanToUser(userId, planId, endDate);
    setAssignPlanDialogOpen(false);
    setUserToAssignPlan(null);
  };

  if (isLoading) {
    return <SubscribersLoading />;
  }

  return (
    <div className="space-y-6 pb-8">
      <SubscribersHeaderSection 
        subscribers={subscribers} 
        isGroupSelected={isGroupSelected} 
        isUpdating={isUpdating}
        onExport={handleExport}
      />

      <SubscriberFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={(value: "all" | "active" | "inactive") => setStatusFilter(value)}
        planFilter={planFilter}
        onPlanFilterChange={setPlanFilter}
        uniquePlans={uniquePlans}
        onExport={handleExport}
      />

      <SubscriberTabs
        subscribers={managedSubscribers}
        unmanagedUsers={unmanagedUsers}
        onEdit={(subscriber) => {
          setSelectedSubscriber(subscriber);
          setEditDialogOpen(true);
        }}
        onRemove={onRemoveClick}
        onUnblock={onUnblockClick}
        onAssignPlan={handleAssignPlan}
      />
      
      <SubscribersCountDisplay 
        filteredCount={filteredSubscribers.length} 
        totalCount={subscribers.length} 
      />

      <SubscriberDialogs 
        selectedSubscriber={selectedSubscriber}
        editDialogOpen={editDialogOpen}
        setEditDialogOpen={setEditDialogOpen}
        subscriberToRemove={subscriberToRemove}
        removeDialogOpen={removeDialogOpen}
        handleRemoveDialogChange={handleRemoveDialogChange}
        subscriberToUnblock={subscriberToUnblock}
        unblockDialogOpen={unblockDialogOpen}
        handleUnblockDialogChange={handleUnblockDialogChange}
        onConfirmRemove={onConfirmRemove}
        onConfirmUnblock={onConfirmUnblock}
        isRemoving={isRemoving}
        isUnblocking={isUnblocking}
        onSuccess={refetch}
      />

      <AssignPlanDialog
        user={userToAssignPlan}
        plans={uniquePlans}
        open={assignPlanDialogOpen}
        onOpenChange={setAssignPlanDialogOpen}
        onAssign={handleAssignPlanSubmit}
      />
    </div>
  );
};

export default Subscribers;
