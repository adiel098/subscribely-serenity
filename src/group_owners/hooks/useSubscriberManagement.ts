
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
      console.log('Attempting to update subscription status and end date...');
      
      const { data: updateData, error: updateError } = await supabase
        .from('community_subscribers')
        .update({
          subscription_status: "inactive",
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

      return true;
    } catch (error) {
      console.error('Detailed error in subscription removal:', error);
      console.error('Error stack:', (error as Error).stack);
      throw error;
    }
  };

  const handleUnblockSubscriber = async (subscriber: Subscriber) => {
    console.log('Starting unblock process for subscriber:', subscriber);
    
    try {
      const { data: updateData, error: updateError } = await supabase
        .from('community_subscribers')
        .update({
          is_active: true,
          subscription_status: "inactive" // We set it to inactive initially
        })
        .eq('id', subscriber.id)
        .select();

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
