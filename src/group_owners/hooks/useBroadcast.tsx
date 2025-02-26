
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BroadcastStatus {
  successCount: number;
  failureCount: number;
  totalRecipients: number;
}

export const useBroadcast = (communityId: string) => {
  return useMutation({
    mutationFn: async ({ 
      message, 
      filterType,
      subscriptionPlanId,
      includeButton
    }: { 
      message: string; 
      filterType: 'all' | 'active' | 'expired' | 'plan';
      subscriptionPlanId?: string;
      includeButton?: boolean;
    }): Promise<BroadcastStatus> => {
      // Build the query based on filter type
      let query = supabase
        .from('telegram_chat_members')
        .select('*')
        .eq('community_id', communityId)
        .eq('is_active', true);

      // Apply filters based on filterType
      switch (filterType) {
        case 'active':
          query = query.eq('subscription_status', true);
          break;
        case 'expired':
          query = query
            .eq('subscription_status', false)
            .not('subscription_end_date', 'is', null);
          break;
        case 'plan':
          if (subscriptionPlanId) {
            query = query.eq('subscription_plan_id', subscriptionPlanId);
          }
          break;
        // 'all' case doesn't need additional filters
      }

      const { data: activeMembers, error: membersError } = await query;

      if (membersError) {
        console.error('Error checking active members:', membersError);
        throw membersError;
      }

      console.log('Filtered members found:', {
        totalActive: activeMembers?.length || 0,
        filterType,
        subscriptionPlanId,
      });

      // If no active members found, return early
      if (!activeMembers || activeMembers.length === 0) {
        return {
          successCount: 0,
          failureCount: 0,
          totalRecipients: 0
        };
      }

      const { data: settings, error: settingsError } = await supabase
        .from('telegram_global_settings')
        .select('bot_token')
        .single();

      if (settingsError || !settings?.bot_token) {
        console.error('Error fetching bot token:', settingsError);
        throw new Error('Bot token not found');
      }

      let successCount = 0;
      let failureCount = 0;

      // Send messages to filtered members
      for (const member of activeMembers) {
        try {
          const response = await fetch(`https://api.telegram.org/bot${settings.bot_token}/sendMessage`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              chat_id: member.telegram_user_id,
              text: message,
              parse_mode: 'HTML'
            }),
          });

          const result = await response.json();
          console.log(`Message sent to ${member.telegram_username || member.telegram_user_id}:`, result);

          if (result.ok) {
            successCount++;
          } else {
            failureCount++;
            console.error(`Failed to send message to ${member.telegram_username || member.telegram_user_id}:`, result);
          }

          // Add small delay between messages to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 35));
        } catch (error) {
          console.error(`Error sending message to ${member.telegram_username || member.telegram_user_id}:`, error);
          failureCount++;
        }
      }

      const status: BroadcastStatus = {
        successCount,
        failureCount,
        totalRecipients: activeMembers.length
      };

      if (status.successCount === 0 && status.totalRecipients > 0) {
        throw new Error('Failed to send message to any users');
      }

      console.log('Broadcast completed with status:', status);
      return status;
    },
    onSuccess: (data) => {
      if (data.totalRecipients === 0) {
        toast.warning('No active users found to send the message');
      } else {
        toast.success(
          `Message sent successfully to ${data.successCount} out of ${data.totalRecipients} users`
        );
      }
    },
    onError: (error) => {
      console.error('Error sending broadcast:', error);
      toast.error(error instanceof Error ? error.message : 'Error sending messages');
    }
  });
};
