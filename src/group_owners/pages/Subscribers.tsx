
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
import { Subscriber } from "../hooks/useSubscribers";

const Subscribers = () => {
  const { selectedCommunityId } = useCommunityContext();
  const [selectedSubscriber, setSelectedSubscriber] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [subscriberToRemove, setSubscriberToRemove] = useState<Subscriber | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const { toast } = useToast();

  const {
    subscribers,
    isLoading,
    isUpdating,
    refetch,
    handleUpdateStatus,
    handleRemoveSubscriber
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

  // Clear dialogs state when component unmounts
  useEffect(() => {
    return () => {
      setRemoveDialogOpen(false);
      setEditDialogOpen(false);
      setSubscriberToRemove(null);
      setSelectedSubscriber(null);
    };
  }, []);

  // Use useCallback to prevent recreation of this function on each render
  const onRemoveClick = useCallback((subscriber: Subscriber) => {
    setSubscriberToRemove(subscriber);
    setRemoveDialogOpen(true);
  }, []);

  const onConfirmRemove = useCallback(async (subscriber: Subscriber) => {
    if (!subscriber) return;
    
    setIsRemoving(true);
    try {
      await handleRemoveSubscriber(subscriber);
      toast({
        title: "Success",
        description: "Subscriber removed successfully"
      });
    } catch (error) {
      console.error("Error removing subscriber:", error);
      toast({
        title: "Error",
        description: "Failed to remove subscriber",
        variant: "destructive"
      });
    } finally {
      setIsRemoving(false);
      setRemoveDialogOpen(false);
      // Use a delay before clearing the subscriber to prevent UI glitches
      setTimeout(() => setSubscriberToRemove(null), 300);
    }
  }, [handleRemoveSubscriber, toast]);

  // Use useCallback for the dialog state handler
  const handleRemoveDialogChange = useCallback((open: boolean) => {
    setRemoveDialogOpen(open);
    if (!open) {
      // Clear the selected subscriber when dialog closes, with a delay
      setTimeout(() => setSubscriberToRemove(null), 300);
    }
  }, []);

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
    </div>
  );
};

export default Subscribers;
