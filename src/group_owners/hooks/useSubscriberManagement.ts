
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
      
      // Update the database to set subscription status to "removed"
      const { error } = await supabase
        .from("telegram_chat_members")
        .update({ 
          subscription_status: "removed",
          is_active: false 
        })
        .eq("id", subscriber.id);

      if (error) {
        console.error("Error updating subscriber status:", error);
        throw error;
      }
      
      // Get the Telegram chat ID from the community
      const { data: community, error: communityError } = await supabase
        .from('communities')
        .select('telegram_chat_id')
        .eq('id', subscriber.community_id)
        .single();
        
      if (communityError || !community?.telegram_chat_id) {
        console.error('Error getting telegram_chat_id:', communityError);
        throw new Error('Could not retrieve Telegram chat ID');
      }
      
      // Remove member from Telegram chat with 'removed' reason
      const { error: kickError } = await supabase.functions.invoke('telegram-webhook', {
        body: { 
          path: '/remove-member',
          chat_id: community.telegram_chat_id,
          user_id: subscriber.telegram_user_id,
          reason: 'removed' // Specify manual removal
        }
      });

      if (kickError) {
        console.error('Error removing member from channel:', kickError);
        throw new Error('Failed to remove member from channel');
      }
      
      await refetch();
      return true;
    } catch (error) {
      console.error("Error removing subscriber:", error);
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
    handleRemoveSubscriber
  };
};
