
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useCommunityContext } from "@/contexts/CommunityContext";
import { EditSubscriberDialog } from "@/group_owners/components/subscribers/EditSubscriberDialog";
import { SubscribersTable } from "@/group_owners/components/subscribers/SubscribersTable";
import { SubscribersHeader } from "../components/subscribers/SubscribersHeader";
import { SubscriberFilters } from "../components/subscribers/SubscriberFilters";
import { useSubscriberManagement } from "../hooks/useSubscriberManagement";
import { useSubscriberFilters } from "../hooks/useSubscriberFilters";
import { Loader2, Users } from "lucide-react";

const Subscribers = () => {
  const { selectedCommunityId } = useCommunityContext();
  const [selectedSubscriber, setSelectedSubscriber] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
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

  const handleExport = () => {
    const exportData = filteredSubscribers.map(sub => ({
      Username: sub.telegram_username || 'No username',
      'Telegram ID': sub.telegram_user_id,
      'Plan Name': sub.plan?.name || 'No plan',
      'Plan Price': sub.plan ? `$${sub.plan.price}` : '-',
      'Plan Interval': sub.plan?.interval || '-',
      Status: sub.subscription_status ? 'Active' : 'Inactive',
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
    
    // Create a download link and trigger it
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'subscribers.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href); // Clean up the URL object

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

