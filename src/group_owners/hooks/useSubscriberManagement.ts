import { useState } from "react";
import { useSubscribers, Subscriber } from "./useSubscribers";
import { supabase } from "@/integrations/supabase/client";

export const useSubscriberManagement = (communityId: string) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { data: subscribers = [], isLoading, error, refetch } = useSubscribers(communityId);

  const handleUpdateStatus = async (newStatus: string) => {
    if (!communityId) return;
    
    setIsUpdating(true);
    try {
      // Determine is_active based on the new status
      const isActive = newStatus === "active";
      
      const { error } = await supabase
        .from("telegram_chat_members")
        .update({ 
          subscription_status: newStatus,
          is_active: isActive
        })
        .eq("community_id", communityId);

      if (error) throw error;
      await refetch();
    } catch (error) {
      console.error("Error updating subscribers status:", error);
      throw error; // Re-throw to allow parent component to handle
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveSubscriber = async (subscriber: Subscriber) => {
    if (!subscriber?.id) {
      console.error("Invalid subscriber provided to handleRemoveSubscriber");
      throw new Error("Invalid subscriber data");
    }
    
    try {
      console.log("Removing subscriber:", subscriber.id, "from community:", subscriber.community_id);
      
      // Call the kick-member function directly with explicit "removed" reason
      const { error: kickError } = await supabase.functions.invoke('kick-member', {
        body: { 
          memberId: subscriber.id,
          reason: 'removed' // Explicitly specify manual removal
        }
      });

      if (kickError) {
        console.error('Error removing subscriber:', kickError);
        throw new Error('Failed to remove subscriber from channel');
      }
      
      await refetch();
      return true;
    } catch (error) {
      console.error("Error removing subscriber:", error);
      throw error;
    }
  };

  const handleUnblockSubscriber = async (subscriber: Subscriber) => {
    if (!subscriber?.id) {
      console.error("Invalid subscriber provided to handleUnblockSubscriber");
      throw new Error("Invalid subscriber data");
    }
    
    try {
      console.log("Unblocking subscriber:", subscriber.id, "from community:", subscriber.community_id);
      
      // Get the Telegram chat ID from the community first
      const { data: community, error: communityError } = await supabase
        .from('communities')
        .select('telegram_chat_id')
        .eq('id', subscriber.community_id)
        .single();
        
      if (communityError || !community?.telegram_chat_id) {
        console.error('Error getting telegram_chat_id:', communityError);
        throw new Error('Could not retrieve Telegram chat ID');
      }
      
      // Unblock member from Telegram using the webhook function
      const { error: unblockError } = await supabase.functions.invoke('telegram-webhook', {
        body: { 
          path: '/unblock-member',
          chat_id: community.telegram_chat_id,
          user_id: subscriber.telegram_user_id
        }
      });

      if (unblockError) {
        console.error('Error unblocking member from channel:', unblockError);
        throw new Error('Failed to unblock member from channel');
      }
      
      // Update the database to set subscription status to "inactive" only after successful unblock
      const { error } = await supabase
        .from("telegram_chat_members")
        .update({ 
          subscription_status: "inactive",
          is_active: true 
        })
        .eq("id", subscriber.id);

      if (error) {
        console.error("Error updating subscriber status:", error);
        throw error;
      }
      
      // Log the action to activity logs
      await supabase
        .from('subscription_activity_logs')
        .insert({
          telegram_user_id: subscriber.telegram_user_id,
          community_id: subscriber.community_id,
          activity_type: 'member_unblocked',
          details: 'User was unblocked by admin',
          status: 'inactive' // Use the new status column
        });
      
      await refetch();
      return true;
    } catch (error) {
      console.error("Error unblocking subscriber:", error);
      throw error;
    }
  };

  return {
    subscribers,
    isLoading,
    error,
    isUpdating,
    refetch,
    handleUpdateStatus,
    handleRemoveSubscriber,
    handleUnblockSubscriber
  };
};

