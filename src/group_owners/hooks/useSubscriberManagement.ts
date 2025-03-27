
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
      // Get the community's Telegram chat ID
      const { data: community, error: communityError } = await supabase
        .from('communities')
        .select('telegram_chat_id')
        .eq('id', subscriber.community_id)
        .single();
        
      if (communityError || !community?.telegram_chat_id) {
        console.error('Error getting telegram_chat_id:', communityError);
        throw new Error('Could not retrieve Telegram chat ID');
      }
      
      console.log(`Using telegram_chat_id: ${community.telegram_chat_id} for member removal`);
      
      // 1. Remove member from Telegram chat through the edge function
      const { error: kickError } = await supabase.functions.invoke('telegram-webhook', {
        body: { 
          path: '/remove-member',
          chat_id: community.telegram_chat_id,
          user_id: subscriber.telegram_user_id,
          reason: 'removed'
        }
      });

      if (kickError) {
        console.error('Error removing member from Telegram:', kickError);
        throw new Error('Failed to remove member from Telegram channel');
      }

      console.log('Successfully removed user from Telegram channel');

      // 2. Explicitly invalidate any invite links for this user
      console.log('Invalidating invite links...');
      
      const { error: inviteError } = await supabase
        .from('subscription_payments')
        .update({ invite_link: null })
        .eq('telegram_user_id', subscriber.telegram_user_id)
        .eq('community_id', subscriber.community_id);
        
      if (inviteError) {
        console.error('Error invalidating invite links:', inviteError);
        // Continue despite error, as the primary goal is to remove the user
      }

      // 3. Update the database record to mark as inactive
      console.log('Updating subscription status in database...');
      
      const { error: updateError } = await supabase
        .from('community_subscribers')
        .update({
          is_active: false,
          subscription_status: "removed",
          subscription_end_date: new Date().toISOString()
        })
        .eq('id', subscriber.id);

      if (updateError) {
        console.error('Error in database update:', updateError);
        throw updateError;
      }

      // 4. Log the removal event
      await supabase
        .from('subscription_activity_logs')
        .insert({
          telegram_user_id: subscriber.telegram_user_id,
          community_id: subscriber.community_id,
          activity_type: 'member_removed',
          details: 'Member manually removed from community by admin',
          status: 'removed'
        });

      console.log('Successfully updated subscriber status and logged removal');

      toast({
        title: "Success",
        description: "Subscriber removed successfully and prevented from rejoining",
      });
      
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
    console.log('Starting un block process for subscriber:', subscriber);
    
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
