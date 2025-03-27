
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSubscribers } from "./useSubscribers";
import { Subscriber } from "./useSubscribers";

export const useSubscriberManagement = (communityId: string) => {
  // Fix: Use subscribers directly instead of data.subscribers
  const { subscribers, isLoading, refetch } = useSubscribers(communityId);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const { toast } = useToast();

  const handleUpdateStatus = async () => {
    setIsUpdating(true);
    try {
      const { error } = await supabase.functions.invoke('telegram-webhook', {
        body: { 
          communityId,
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
      // First, attempt to remove the user from the Telegram channel
      console.log('Attempting to remove user from Telegram channel...');
      
      // Important fix: Ensure we're sending the correct chat_id format
      // The community_id is the UUID in our database, but Telegram needs the actual chat_id
      const { data: community, error: communityError } = await supabase
        .from('communities')
        .select('telegram_chat_id')
        .eq('id', subscriber.community_id)
        .single();
        
      if (communityError || !community?.telegram_chat_id) {
        console.error('Error getting telegram_chat_id:', communityError);
        throw new Error('Could not retrieve Telegram chat ID');
      }
      
      console.log(`Using telegram_chat_id: ${community.telegram_chat_id} instead of community_id: ${subscriber.community_id}`);
      
      // 1. Remove member from Telegram chat through the edge function
      const { error: kickError } = await supabase.functions.invoke('telegram-webhook', {
        body: { 
          path: '/remove-member',
          chat_id: community.telegram_chat_id,
          user_id: subscriber.telegram_user_id
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
      
      const { data: updateData, error: updateError } = await supabase
        .from('telegram_chat_members')
        .update({
          subscription_status: 'removed',
          is_active: false
          // No longer updating subscription_end_date as requested
        })
        .eq('id', subscriber.id)
        .select();

      console.log('Update response:', { data: updateData, error: updateError });

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
          details: 'Member manually removed from community by admin'
        });

      console.log('Successfully updated subscriber status and logged removal');

      toast({
        title: "Success",
        description: "Subscriber removed successfully and prevented from rejoining",
      });
      
      console.log('Refreshing data...');
      await refetch();
      console.log('Data refresh completed');
      
      return true;
    } catch (error) {
      console.error('Detailed error in subscription removal:', error);
      console.error('Error stack:', (error as Error).stack);
      toast({
        title: "Error",
        description: "Failed to remove subscriber",
        variant: "destructive",
      });
      
      return false;
    }
  };

  const handleUnblockSubscriber = async (subscriber: Subscriber) => {
    // Implementation for unblocking
    return true;
  };

  const assignPlanToUser = async (userId: string, planId: string, endDate: Date) => {
    // Implementation for assigning plan
    return true;
  };

  const removeSubscriber = async (subscriber: Subscriber, botToken: string) => {
    setIsRemoving(true);
    try {
      // Call the kick-member edge function
      const { data, error } = await supabase.functions.invoke("kick-member", {
        body: {
          member_id: subscriber.id,
          telegram_user_id: subscriber.telegram_user_id,
          chat_id: subscriber.community_id, // Using community_id as chat_id
          bot_token: botToken,
        },
      });

      if (error) {
        console.error("Error removing subscriber:", error);
        toast({
          title: "Error",
          description: "Failed to remove subscriber. Please try again.",
          variant: "destructive",
        });
        return false;
      }

      // Handle the response from the edge function
      if (data.success) {
        console.log("Subscriber removed successfully", data);
        
        // Show appropriate success message
        if (!data.telegram_success) {
          toast({
            title: "Partial Success",
            description: `User marked as removed in database, but could not be removed from Telegram group: ${data.telegram_error}`,
            variant: "default",
          });
        } else {
          toast({
            title: "Success",
            description: "Subscriber removed successfully",
          });
        }
        
        await refetch();
        return true;
      } else {
        console.error("Failed to remove subscriber:", data.error);
        toast({
          title: "Error",
          description: data.error || "Failed to remove subscriber",
          variant: "destructive",
        });
        return false;
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsRemoving(false);
    }
  };

  return {
    subscribers,
    isLoading,
    isUpdating,
    isRemoving,
    refetch,
    handleUpdateStatus,
    handleRemoveSubscriber,
    handleUnblockSubscriber,
    assignPlanToUser,
    removeSubscriber
  };
};
