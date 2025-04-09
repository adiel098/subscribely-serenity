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
    setIsRemoving(true);
    
    try {
      // Important fix: Ensure we're sending the correct chat_id format
      // The community_id is the UUID in our database, but Telegram needs the actual chat_id
      const { data: community, error: communityError } = await supabase
        .from('communities')
        .select('telegram_chat_id, project_id')  
        .eq('id', subscriber.community_id)
        .single();
        
      if (communityError || !community?.telegram_chat_id) {
        console.error('❌ Error getting telegram_chat_id:', communityError);
        throw new Error('Could not retrieve Telegram chat ID');
      }
      
      console.log(`Using telegram_chat_id: ${community.telegram_chat_id} instead of community_id: ${subscriber.community_id}`);
      
      // 1. Get bot token from projects table
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('bot_token')
        .eq('id', community.project_id)
        .single();
      
      if (projectError) {
        console.error('❌ Error fetching project:', projectError);
        throw new Error('Could not retrieve project settings');
      }

      if (!project.bot_token) {
        console.error('❌ No bot token found for project');
        throw new Error('Bot token not configured for this project');
      }

      console.log('✅ Successfully retrieved bot token from project');
      
      // 2. Remove member from Telegram chat through the kick-member edge function
      const { data: kickResult, error: kickError } = await supabase.functions.invoke('kick-member', {
        body: { 
          member_id: subscriber.id,
          telegram_user_id: subscriber.telegram_user_id,
          chat_id: community.telegram_chat_id,
          bot_token: project.bot_token
        }
      });
      
      if (kickError) {
        console.error('❌ Error kicking member:', kickError);
        throw kickError;
      }

      console.log('✅ Successfully kicked member from Telegram chat');
      
      if (!kickResult?.success) {
        console.error('Kick-member function returned error:', kickResult?.error);
        // Continue despite error to update the database status
        console.log('Continuing with database update despite Telegram API error');
      } else {
        console.log('Successfully removed user from Telegram channel');
      }

      // 3. Update the subscriber record to mark as removed
      console.log('Updating subscription status in database to "removed"...');
      
      const { error: updateError } = await supabase
        .from('community_subscribers')
        .update({
          subscription_status: 'removed',
          is_active: false
        })
        .eq('id', subscriber.id);

      if (updateError) {
        console.error('Error in database update:', updateError);
        throw updateError;
      }

      console.log('Successfully updated subscriber status to "removed"');

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
        description: "Subscriber removed successfully",
      });
      
      console.log('Refreshing data...');
      await refetch();
      console.log('Data refresh completed');
    } catch (error) {
      console.error('Detailed error in subscription removal:', error);
      console.error('Error stack:', (error as Error).stack);
      toast({
        title: "Error",
        description: "Failed to remove subscriber",
        variant: "destructive",
      });
    } finally {
      setIsRemoving(false);
    }
  };

  const handleUnblockSubscriber = async (subscriber: Subscriber) => {
    try {
      // Update the subscriber record to active status
      const { error: updateError } = await supabase
        .from('community_subscribers')
        .update({
          subscription_status: 'active',
          is_active: true
        })
        .eq('id', subscriber.id);

      if (updateError) {
        console.error('Error unblocking subscriber:', updateError);
        throw updateError;
      }

      // Log the unblock event
      await supabase
        .from('subscription_activity_logs')
        .insert({
          telegram_user_id: subscriber.telegram_user_id,
          community_id: subscriber.community_id,
          activity_type: 'member_unblocked',
          details: 'Member unblocked by admin',
          status: 'active'
        });

      return true;
    } catch (error) {
      console.error('Error in handleUnblockSubscriber:', error);
      throw error;
    }
  };

  const assignPlanToUser = async (userId: string, planId: string, endDate: Date) => {
    try {
      // Get the subscriber record
      const { data: subscriber, error: subscriberError } = await supabase
        .from('community_subscribers')
        .select('*')
        .eq('id', userId)
        .single();

      if (subscriberError) {
        console.error('Error getting subscriber:', subscriberError);
        throw subscriberError;
      }

      // Update the subscriber with the new plan and end date
      const { error: updateError } = await supabase
        .from('community_subscribers')
        .update({
          subscription_plan_id: planId,
          subscription_status: 'active',
          is_active: true,
          subscription_start_date: new Date().toISOString(),
          subscription_end_date: endDate.toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating subscriber plan:', updateError);
        throw updateError;
      }

      // Log the plan assignment
      await supabase
        .from('subscription_activity_logs')
        .insert({
          telegram_user_id: subscriber.telegram_user_id,
          community_id: subscriber.community_id,
          activity_type: 'plan_assigned',
          details: `Plan ${planId} assigned by admin until ${endDate.toISOString()}`,
          status: 'active'
        });

      toast({
        title: "Success",
        description: "Plan assigned successfully",
      });

      await refetch();
      return true;
    } catch (error) {
      console.error('Error in assignPlanToUser:', error);
      toast({
        title: "Error",
        description: "Failed to assign plan",
        variant: "destructive",
      });
      throw error;
    }
  };

  const removeSubscriber = async (subscriber: Subscriber, botToken: string) => {
    try {
      // Get the community's telegram chat ID
      const { data: community, error: communityError } = await supabase
        .from('communities')
        .select('telegram_chat_id')
        .eq('id', subscriber.community_id)
        .single();
      
      if (communityError || !community?.telegram_chat_id) {
        throw new Error('Could not find Telegram chat ID for this community');
      }

      console.log('Calling kick-member function for subscriber:', subscriber.id);
      
      const { data, error } = await supabase.functions.invoke('kick-member', {
        body: { 
          member_id: subscriber.id,
          telegram_user_id: subscriber.telegram_user_id,
          chat_id: community.telegram_chat_id,
          bot_token: botToken
        }
      });
      
      if (error) {
        console.error('Error calling kick-member function:', error);
        throw new Error(`Error from kick-member function: ${error.message}`);
      }
      
      console.log('Response from kick-member function:', data);
      
      if (!data.success) {
        console.error('kick-member function reported failure:', data);
        throw new Error(`kick-member function failed: ${data.error || 'Unknown error'}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error in removeSubscriber:', error);
      throw error;
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
