
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSubscribers, Subscriber } from "./useSubscribers";
import { useToast } from "@/components/ui/use-toast";

export const useSubscriberManagement = (entityId: string) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const { data: subscribers = [], isLoading, refetch } = useSubscribers(entityId);

  const updateSubscriberStatus = useCallback(async () => {
    if (!entityId) return;
    
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
  }, [entityId, refetch, toast]);

  const handleRemoveSubscriber = useCallback(async (subscriber: Subscriber) => {
    try {
      console.log('Removing subscriber:', subscriber.telegram_user_id);
      
      const { error } = await supabase
        .from('community_subscribers')
        .update({
          subscription_status: 'removed',
          subscription_end_date: new Date().toISOString(),
          subscription_plan_id: null,
          is_active: false
        })
        .eq('id', subscriber.id);

      if (error) {
        console.error('Error removing subscriber:', error);
        throw error;
      }

      console.log('Successfully removed subscriber');
      return true;
    } catch (error) {
      console.error('Error in handleRemoveSubscriber:', error);
      throw error;
    }
  }, []);

  const handleUnblockSubscriber = useCallback(async (subscriber: Subscriber) => {
    try {
      console.log('Unblocking subscriber:', subscriber.telegram_user_id);
      
      const { error } = await supabase
        .from('community_subscribers')
        .update({
          subscription_status: 'inactive',
          is_active: true
        })
        .eq('id', subscriber.id);

      if (error) {
        console.error('Error unblocking subscriber:', error);
        throw error;
      }

      console.log('Successfully unblocked subscriber');
      return true;
    } catch (error) {
      console.error('Error in handleUnblockSubscriber:', error);
      throw error;
    }
  }, []);

  const assignPlanToUser = useCallback(async (
    userId: string, 
    planId: string, 
    endDate: Date
  ) => {
    if (!entityId || !userId || !planId) return;
    
    try {
      console.log('Assigning plan to user:', { userId, planId, endDate, entityId });
      
      const { error } = await supabase
        .from('community_subscribers')
        .update({
          subscription_status: 'active',
          subscription_plan_id: planId,
          subscription_start_date: new Date().toISOString(),
          subscription_end_date: endDate.toISOString(),
          is_active: true
        })
        .eq('telegram_user_id', userId)
        .eq('community_id', entityId);

      if (error) {
        console.error('Error assigning plan:', error);
        throw error;
      }

      console.log('Successfully assigned plan');
      await refetch();
      
      toast({
        title: "Success",
        description: "Subscription plan assigned successfully",
      });
      
      return true;
    } catch (error) {
      console.error('Error in assignPlanToUser:', error);
      toast({
        title: "Error",
        description: "Failed to assign subscription plan",
        variant: "destructive",
      });
      throw error;
    }
  }, [entityId, refetch, toast]);

  return {
    subscribers,
    isLoading,
    isUpdating,
    refetch,
    updateSubscriberStatus,
    handleRemoveSubscriber,
    handleUnblockSubscriber,
    assignPlanToUser
  };
};
