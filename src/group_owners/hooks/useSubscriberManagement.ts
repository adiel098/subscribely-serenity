
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useSubscribers, Subscriber } from "./useSubscribers";
import { supabase } from "@/integrations/supabase/client";

export const useSubscriberManagement = (entityId: string) => {
  const { subscribers, isLoading, refetch } = useSubscribers(entityId);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleUpdateStatus = async () => {
    setIsUpdating(true);
    try {
      const { error } = await supabase.functions.invoke('telegram-webhook', {
        body: { 
          communityId: entityId,
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
      // Call kick-member edge function directly instead of going through webhook
      console.log('Calling kick-member function to remove subscriber from Telegram...');
      
      const { data, error } = await supabase.functions.invoke('kick-member', {
        body: { 
          memberId: subscriber.id,
          reason: 'removed'
        }
      });

      if (error) {
        console.error('Error removing member:', error);
        throw new Error('Failed to remove member from Telegram channel: ' + error.message);
      }

      if (!data.success) {
        console.error('Kick-member function returned failure:', data);
        throw new Error('Failed to remove member: ' + (data.error || 'Unknown error'));
      }

      console.log('Successfully removed user from Telegram channel');
      
      toast({
        title: "Success",
        description: "Subscriber removed successfully and prevented from rejoining",
      });
      
      await refetch();
      return true;
    } catch (error) {
      console.error('Detailed error in subscription removal:', error);
      console.error('Error stack:', (error as Error).stack);
      
      toast({
        title: "Error",
        description: "Failed to remove subscriber: " + (error as Error).message,
        variant: "destructive",
      });
      
      throw error;
    }
  };

  const handleUnblockSubscriber = async (subscriber: Subscriber) => {
    console.log('Starting unblock process for subscriber:', subscriber);
    
    try {
      const { error: updateError } = await supabase
        .from('community_subscribers')
        .update({
          is_active: true,
          subscription_status: "inactive" // We set it to inactive initially
        })
        .eq('id', subscriber.id);

      if (updateError) {
        console.error('Error in unblock:', updateError);
        throw updateError;
      }

      console.log('Successfully unblocked subscriber');

      return true;
    } catch (error) {
      console.error('Error in subscriber unblock:', error);
      throw error;
    }
  };

  const assignPlanToUser = async (userId: string, planId: string, endDate: Date) => {
    try {
      const startDate = new Date();
      
      const { data, error } = await supabase
        .from('community_subscribers')
        .update({
          subscription_plan_id: planId,
          subscription_status: "active",
          subscription_start_date: startDate.toISOString(),
          subscription_end_date: endDate.toISOString()
        })
        .eq('id', userId)
        .select();
      
      if (error) throw error;
      
      await refetch();
      return data;
    } catch (error) {
      console.error('Error assigning plan to user:', error);
      throw error;
    }
  };

  return {
    subscribers,
    isLoading,
    isUpdating,
    refetch,
    handleUpdateStatus,
    handleRemoveSubscriber,
    handleUnblockSubscriber,
    assignPlanToUser
  };
};
