
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

  useEffect(() => {
    return () => {
      setRemoveDialogOpen(false);
      setUnblockDialogOpen(false);
      setEditDialogOpen(false);
      setIsRemoving(false);
      setIsUnblocking(false);
      
      setTimeout(() => {
        setSubscriberToRemove(null);
        setSubscriberToUnblock(null);
        setSelectedSubscriber(null);
      }, 500);
    };
  }, []);

  const onRemoveClick = useCallback((subscriber: Subscriber) => {
    setSubscriberToRemove(null);
    setTimeout(() => {
      setSubscriberToRemove(subscriber);
      setRemoveDialogOpen(true);
    }, 50);
  }, []);

  const onUnblockClick = useCallback((subscriber: Subscriber) => {
    setSubscriberToUnblock(null);
    setTimeout(() => {
      setSubscriberToUnblock(subscriber);
      setUnblockDialogOpen(true);
    }, 50);
  }, []);

  const onConfirmRemove = useCallback(async (subscriber: Subscriber) => {
    if (!subscriber || isRemoving) return;
    
    setIsRemoving(true);
    try {
      await handleRemoveSubscriber(subscriber);
      toast({
        title: "Success",
        description: "Subscriber removed successfully"
      });
      
      await refetch();
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
      
      setTimeout(() => {
        setSubscriberToRemove(null);
      }, 500);
    }
  }, [handleRemoveSubscriber, toast, refetch, isRemoving]);

  const onConfirmUnblock = useCallback(async (subscriber: Subscriber) => {
    if (!subscriber || isUnblocking) return;
    
    setIsUnblocking(true);
    try {
      await handleUnblockSubscriber(subscriber);
      toast({
        title: "Success",
        description: "Subscriber unblocked successfully"
      });
      
      await refetch();
    } catch (error) {
      console.error("Error unblocking subscriber:", error);
      toast({
        title: "Error",
        description: "Failed to unblock subscriber",
        variant: "destructive"
      });
    } finally {
      setIsUnblocking(false);
      setUnblockDialogOpen(false);
      
      setTimeout(() => {
        setSubscriberToUnblock(null);
      }, 500);
    }
  }, [handleUnblockSubscriber, toast, refetch, isUnblocking]);

  const handleRemoveDialogChange = useCallback((open: boolean) => {
    if (isRemoving && open === false) {
      return;
    }
    
    setRemoveDialogOpen(open);
    
    if (!open) {
      setTimeout(() => {
        setSubscriberToRemove(null);
      }, 500);
    }
  }, [isRemoving]);

  const handleUnblockDialogChange = useCallback((open: boolean) => {
    if (isUnblocking && open === false) {
      return;
    }
    
    setUnblockDialogOpen(open);
    
    if (!open) {
      setTimeout(() => {
        setSubscriberToUnblock(null);
      }, 500);
    }
  }, [isUnblocking]);

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
        <div className="relative">
          <Loader2 className="h-10 w-10 animate-spin text-gray-400" />
        </div>
        <p className="text-gray-600">Loading subscribers data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <SubscribersHeader
        onUpdateStatus={() => {}}
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 border shadow-sm">
          <div className="text-2xl font-bold text-gray-800">{subscribers.length}</div>
          <div className="text-sm text-gray-600">Total Subscribers</div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border shadow-sm">
          <div className="text-2xl font-bold text-green-700">
            {subscribers.filter(sub => sub.subscription_status === 'active').length}
          </div>
          <div className="text-sm text-gray-600">Active Subscribers</div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border shadow-sm">
          <div className="text-2xl font-bold text-amber-700">
            {subscribers.filter(sub => sub.subscription_status !== 'active').length}
          </div>
          <div className="text-sm text-gray-600">Inactive Subscribers</div>
        </div>
      </div>

      <SubscribersTable 
        subscribers={filteredSubscribers}
        onEdit={(subscriber) => {
          setSelectedSubscriber(subscriber);
          setEditDialogOpen(true);
        }}
        onRemove={onRemoveClick}
        onUnblock={onUnblockClick}
      />
      
      {filteredSubscribers.length > 0 && (
        <div className="text-center pt-2">
          <p className="text-sm text-gray-500">
            Showing {filteredSubscribers.length} of {subscribers.length} total subscribers
          </p>
        </div>
      )}

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
