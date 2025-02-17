
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logAnalyticsEvent } from "./useAnalytics";

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
      console.log('Starting broadcast with params:', {
        communityId,
        message,
        filterType,
        subscriptionPlanId,
        includeButton
      });

      const { data, error } = await supabase.functions.invoke('telegram-webhook', {
        body: {
          path: '/broadcast',
          communityId,
          message,
          filterType,
          subscriptionPlanId,
          includeButton
        }
      });

      if (error) {
        console.error('Broadcast error:', error);
        throw error;
      }

      console.log('Broadcast response:', data);

      if (!data) {
        throw new Error('No response from server');
      }

      let status: BroadcastStatus;

      if (data.ok === true) {
        status = {
          successCount: 1,
          failureCount: 0,
          totalRecipients: 1
        };
      }
      else if (typeof data.successCount === 'number' && typeof data.totalRecipients === 'number') {
        status = {
          successCount: data.successCount,
          failureCount: data.failureCount || 0,
          totalRecipients: data.totalRecipients
        };
      } else {
        throw new Error('Invalid response format from server');
      }

      // רישום האירוע באנליטיקס
      try {
        await logAnalyticsEvent(
          communityId,
          'message_sent',
          null,
          {
            message,
            filter_type: filterType,
            success_count: status.successCount,
            failure_count: status.failureCount,
            total_recipients: status.totalRecipients
          },
          status.successCount
        );
      } catch (error) {
        console.error('Failed to log analytics event:', error);
      }

      return status;
    },
    onSuccess: (data) => {
      if (!data.totalRecipients) {
        toast.warning('No recipients found matching the selected criteria');
        return;
      }
      
      toast.success(
        `Successfully sent messages to ${data.successCount} out of ${data.totalRecipients} users`
      );

      if (data.failureCount > 0) {
        toast.warning(
          `Failed to send messages to ${data.failureCount} users`
        );
      }
    },
    onError: (error: any) => {
      console.error('Error in broadcast mutation:', error);
      toast.error(error?.message || 'Error sending broadcast messages');
    }
  });
};
