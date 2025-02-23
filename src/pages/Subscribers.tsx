import { useCommunityContext } from "@/contexts/CommunityContext";
import { useSubscribers } from "@/hooks/useSubscribers";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { EditSubscriberDialog } from "@/components/subscribers/EditSubscriberDialog";
import { SubscribersTable } from "@/components/subscribers/SubscribersTable";
import { SearchBar } from "@/components/subscribers/SearchBar";
import { StatusFilter } from "@/components/subscribers/StatusFilter";
import { PlanFilter } from "@/components/subscribers/PlanFilter";
import { SubscribersHeader } from "@/components/subscribers/SubscribersHeader";

interface MSNavigator extends Navigator {
  msSaveBlob?: (blob: Blob, defaultName: string) => boolean;
}

const Subscribers = () => {
  const { selectedCommunityId } = useCommunityContext();
  const { data: subscribers, isLoading, refetch } = useSubscribers(selectedCommunityId || "");
  const [selectedSubscriber, setSelectedSubscriber] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [planFilter, setPlanFilter] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleEditSuccess = () => {
    refetch();
  };

  const handleUpdateStatus = async () => {
    setIsUpdating(true);
    try {
      const { error } = await supabase.functions.invoke('telegram-webhook', {
        body: { 
          communityId: selectedCommunityId,
          path: '/update-activity'
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Member status updated successfully",
      });
      
      await refetch();
    } catch (error) {
      console.error('Error updating member status:', error);
      toast({
        title: "Error",
        description: "Failed to update member status",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

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
    const msNavigator = navigator as MSNavigator;
    
    if (msNavigator.msSaveBlob) {
      msNavigator.msSaveBlob(blob, 'subscribers.csv');
    } else {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', 'subscribers.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    toast({
      title: "Success",
      description: "Subscribers data exported successfully",
    });
  };

  const handleRemoveSubscriber = async (subscriber: any) => {
    console.log('Starting subscription removal process for subscriber:', subscriber);
    
    try {
      console.log('Attempting to update subscription status and end date...');
      
      const { data: updateData, error: updateError } = await supabase
        .from('telegram_chat_members')
        .update({
          subscription_status: false,
          subscription_end_date: new Date().toISOString(),
          subscription_plan_id: null
        })
        .eq('id', subscriber.id)
        .select();

      console.log('Update response:', { data: updateData, error: updateError });

      if (updateError) {
        console.error('Error in update:', updateError);
        throw updateError;
      }

      console.log('Successfully updated subscriber status');

      toast({
        title: "Success",
        description: "Subscription cancelled successfully",
      });
      
      console.log('Refreshing data...');
      await refetch();
      console.log('Data refresh completed');
    } catch (error) {
      console.error('Detailed error in subscription removal:', error);
      console.error('Error stack:', (error as Error).stack);
      toast({
        title: "Error",
        description: "Failed to cancel subscription",
        variant: "destructive",
      });
    }
  };

  const filteredSubscribers = (subscribers || []).filter((subscriber) => {
    const matchesSearch = (subscriber.telegram_username || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase()) ||
      subscriber.telegram_user_id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && subscriber.subscription_status) ||
      (statusFilter === "inactive" && !subscriber.subscription_status);

    const matchesPlan =
      !planFilter ||
      subscriber.plan?.id === planFilter;

    return matchesSearch && matchesStatus && matchesPlan;
  });

  const uniquePlans = Array.from(
    new Set((subscribers || []).map((s) => s.plan).filter(Boolean))
  );

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
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
};

export default Subscribers;
