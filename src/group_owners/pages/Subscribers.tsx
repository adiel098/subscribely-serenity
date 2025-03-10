
import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useCommunityContext } from "@/contexts/CommunityContext";
import { EditSubscriberDialog } from "@/group_owners/components/subscribers/EditSubscriberDialog";
import { SubscribersTable } from "@/group_owners/components/subscribers/SubscribersTable";
import { SubscribersHeader } from "../components/subscribers/SubscribersHeader";
import { SubscriberFilters } from "../components/subscribers/SubscriberFilters";
import { useSubscriberManagement } from "../hooks/useSubscriberManagement";
import { useSubscriberFilters } from "../hooks/useSubscriberFilters";
import { Loader2 } from "lucide-react";
import { RemoveSubscriberDialog } from "../components/subscribers/RemoveSubscriberDialog";
import { UnblockSubscriberDialog } from "../components/subscribers/UnblockSubscriberDialog";
import { Subscriber } from "../hooks/useSubscribers";

const Subscribers = () => {
  const { selectedCommunityId } = useCommunityContext();
  const [selectedSubscriber, setSelectedSubscriber] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [unblockDialogOpen, setUnblockDialogOpen] = useState(false);
  const [subscriberToRemove, setSubscriberToRemove] = useState<Subscriber | null>(null);
  const [subscriberToUnblock, setSubscriberToUnblock] = useState<Subscriber | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isUnblocking, setIsUnblocking] = useState(false);
  const { toast } = useToast();

  const {
    subscribers,
    isLoading,
    isUpdating,
    refetch,
    handleUpdateStatus,
    handleRemoveSubscriber,
    handleUnblockSubscriber
  } = useSubscriberManagement(selectedCommunityId || "");

  const {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    planFilter,
    setPlanFilter,
    filteredSubscribers,
    uniquePlans
  } = useSubscriberFilters(subscribers);

  // Clean up state when component unmounts
  useEffect(() => {
    return () => {
      setRemoveDialogOpen(false);
      setUnblockDialogOpen(false);
      setEditDialogOpen(false);
      setIsRemoving(false);
      setIsUnblocking(false);
      
      // Use setTimeout to ensure state cleanup happens after rendering
      setTimeout(() => {
        setSubscriberToRemove(null);
        setSubscriberToUnblock(null);
        setSelectedSubscriber(null);
      }, 500);
    };
  }, []);

  // Handle remove click with proper event isolation
  const onRemoveClick = useCallback((subscriber: Subscriber) => {
    // Clear any existing state first
    setSubscriberToRemove(null);
    
    // Use setTimeout to ensure state is updated after current execution
    setTimeout(() => {
      setSubscriberToRemove(subscriber);
      setRemoveDialogOpen(true);
    }, 50);
  }, []);

  // Handle unblock click with proper event isolation
  const onUnblockClick = useCallback((subscriber: Subscriber) => {
    // Clear any existing state first
    setSubscriberToUnblock(null);
    
    // Use setTimeout to ensure state is updated after current execution
    setTimeout(() => {
      setSubscriberToUnblock(subscriber);
      setUnblockDialogOpen(true);
    }, 50);
  }, []);

  // Handle confirmation with proper error handling
  const onConfirmRemove = useCallback(async (subscriber: Subscriber) => {
    if (!subscriber || isRemoving) return;
    
    setIsRemoving(true);
    try {
      await handleRemoveSubscriber(subscriber);
      toast({
        title: "Success",
        description: "Subscriber removed successfully"
      });
      
      // Use refetch to update the table data
      await refetch();
    } catch (error) {
      console.error("Error removing subscriber:", error);
      toast({
        title: "Error",
        description: "Failed to remove subscriber",
        variant: "destructive"
      });
    } finally {
      // Clean up state safely with delays to prevent UI glitches
      setIsRemoving(false);
      setRemoveDialogOpen(false);
      
      // Use a delay to ensure dialog is fully closed before clearing state
      setTimeout(() => {
        setSubscriberToRemove(null);
      }, 500);
    }
  }, [handleRemoveSubscriber, toast, refetch, isRemoving]);

  // Handle unblock confirmation
  const onConfirmUnblock = useCallback(async (subscriber: Subscriber) => {
    if (!subscriber || isUnblocking) return;
    
    setIsUnblocking(true);
    try {
      await handleUnblockSubscriber(subscriber);
      toast({
        title: "Success",
        description: "Subscriber unblocked successfully"
      });
      
      // Use refetch to update the table data
      await refetch();
    } catch (error) {
      console.error("Error unblocking subscriber:", error);
      toast({
        title: "Error",
        description: "Failed to unblock subscriber",
        variant: "destructive"
      });
    } finally {
      // Clean up state safely with delays to prevent UI glitches
      setIsUnblocking(false);
      setUnblockDialogOpen(false);
      
      // Use a delay to ensure dialog is fully closed before clearing state
      setTimeout(() => {
        setSubscriberToUnblock(null);
      }, 500);
    }
  }, [handleUnblockSubscriber, toast, refetch, isUnblocking]);

  // Safe handler for dialog state changes
  const handleRemoveDialogChange = useCallback((open: boolean) => {
    if (isRemoving && open === false) {
      // If removing is in progress, don't allow closing
      return;
    }
    
    setRemoveDialogOpen(open);
    
    if (!open) {
      // Use longer delay to ensure dialog animation completes
      setTimeout(() => {
        setSubscriberToRemove(null);
      }, 500);
    }
  }, [isRemoving]);

  // Safe handler for unblock dialog state changes
  const handleUnblockDialogChange = useCallback((open: boolean) => {
    if (isUnblocking && open === false) {
      // If unblocking is in progress, don't allow closing
      return;
    }
    
    setUnblockDialogOpen(open);
    
    if (!open) {
      // Use longer delay to ensure dialog animation completes
      setTimeout(() => {
        setSubscriberToUnblock(null);
      }, 500);
    }
  }, [isUnblocking]);

  // Handle export functionality
  const handleExport = () => {
    const exportData = filteredSubscribers.map(sub => ({
      Username: sub.telegram_username || 'No username',
      'Telegram ID': sub.telegram_user_id,
      'Plan Name': sub.plan?.name || 'No plan',
      'Plan Price': sub.plan ? `$${sub.plan.price}` : '-',
      'Plan Interval': sub.plan?.interval || '-',
      Status: sub.subscription_status,
      'Start Date': sub.subscription_start_date ? new Date(sub.subscription_start_date).toLocaleDateString() : '-',
      'End Date': sub.subscription_end_date ? new Date(sub.subscription_end_date).toLocaleDateString() : '-',
      'Joined At': new Date(sub.joined_at).toLocaleDateString(),
    }));

    const headers = Object.keys(exportData[0]);
    const csvRows = [
      headers.join(','),
      ...exportData.map(row => 
        headers.map(header => 
          JSON.stringify(row[header as keyof typeof row])).join(',')
      )
    ];
    const csvString = csvRows.join('\n');

    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'subscribers.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);

    toast({
      title: "Success",
      description: "Subscribers data exported successfully",
    });
  };

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

      <SubscriberFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        planFilter={planFilter}
        onPlanFilterChange={setPlanFilter}
        uniquePlans={uniquePlans}
      />

      <SubscribersTable 
        subscribers={filteredSubscribers}
        onEdit={(subscriber) => {
          setSelectedSubscriber(subscriber);
          setEditDialogOpen(true);
        }}
        onRemove={onRemoveClick}
        onUnblock={onUnblockClick}
      />

      {selectedSubscriber && (
        <EditSubscriberDialog
          subscriber={selectedSubscriber}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSuccess={refetch}
        />
      )}

      <RemoveSubscriberDialog
        subscriber={subscriberToRemove}
        open={removeDialogOpen}
        onOpenChange={handleRemoveDialogChange}
        onConfirm={onConfirmRemove}
        isProcessing={isRemoving}
      />

      <UnblockSubscriberDialog
        subscriber={subscriberToUnblock}
        open={unblockDialogOpen}
        onOpenChange={handleUnblockDialogChange}
        onConfirm={onConfirmUnblock}
        isProcessing={isUnblocking}
      />
    </div>
  );
};

export default Subscribers;
