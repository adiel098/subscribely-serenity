
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
import { Users, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

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
    <div className="container px-0 py-4 max-w-5xl ml-4 space-y-6 pb-8">
      <div className="space-y-6 max-w-7xl px-0 py-0 my-[6px]">
        <motion.div className="flex items-center space-x-3" initial={{
          opacity: 0,
          y: -20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.5
        }}>
          <div className="p-3 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl">
            <Users className="h-8 w-8 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Subscribers <Sparkles className="h-5 w-5 inline text-amber-400" />
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage {isGroupSelected ? "group" : "community"} subscribers and their access
            </p>
          </div>
        </motion.div>

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
      </div>

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
