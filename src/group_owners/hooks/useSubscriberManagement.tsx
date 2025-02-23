import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSubscribers } from "@/group_owners/hooks/useSubscribers";
import { Subscriber } from "@/group_owners/hooks/useSubscribers";

export const useSubscriberManagement = (communityId: string) => {
  const { data: subscribers, isLoading, refetch } = useSubscribers(communityId || "");
  const [selectedSubscriber, setSelectedSubscriber] = useState<Subscriber | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [planFilter, setPlanFilter] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleUpdateStatus = async () => {
    setIsUpdating(true);
    try {
      const { error } = await supabase.functions.invoke('telegram-webhook', {
        body: { 
          communityId: communityId,
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

  const handleRemoveSubscriber = async (subscriber: Subscriber) => {
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

  return {
    subscribers: filteredSubscribers,
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
  };
};

interface MSNavigator extends Navigator {
  msSaveBlob?: (blob: Blob, defaultName: string) => boolean;
}
