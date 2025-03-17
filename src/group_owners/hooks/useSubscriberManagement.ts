
import { useState } from "react";
import { useSubscribers, Subscriber } from "./useSubscribers";
import { supabase } from "@/integrations/supabase/client";
import { useCommunityContext } from "@/contexts/CommunityContext";

export const useSubscriberManagement = (communityId: string) => {
  const { isGroupSelected } = useCommunityContext();
  const { data: subscribers = [], isLoading, refetch } = useSubscribers(communityId);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleRemoveSubscriber = async (subscriber: Subscriber) => {
    console.log(`Starting subscription removal process for subscriber in ${isGroupSelected ? 'group' : 'community'}:`, subscriber);
    
    try {
      console.log('Attempting to update subscription status and end date...');
      
      const { error: updateError } = await supabase
        .from('community_subscribers')
        .update({
          subscription_status: 'inactive',
          subscription_end_date: new Date().toISOString(),
          subscription_plan_id: null
        })
        .eq('id', subscriber.id);

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
    console.log(`Starting unblock process for subscriber in ${isGroupSelected ? 'group' : 'community'}:`, subscriber);
    
    try {
      const { error: updateError } = await supabase
        .from('community_subscribers')
        .update({
          is_blocked: false
        })
        .eq('id', subscriber.id);

      if (updateError) {
        console.error('Error in unblock:', updateError);
        throw updateError;
      }

      console.log('Successfully unblocked subscriber');
      return true;
    } catch (error) {
      console.error('Detailed error in subscriber unblock:', error);
      console.error('Error stack:', (error as Error).stack);
      throw error;
    }
  };

  return {
    subscribers,
    isLoading,
    isUpdating,
    setIsUpdating,
    refetch,
    handleRemoveSubscriber,
    handleUnblockSubscriber
  };
};
