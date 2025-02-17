
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
      console.log('=== Starting broadcast ===');
      console.log('Broadcast parameters:', {
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

      console.log('Broadcast status:', status);

      // רישום האירוע באנליטיקס
      try {
        console.log('Attempting to log analytics event...');
        const analyticsData = {
          message,
          filter_type: filterType,
          success_count: status.successCount,
          failure_count: status.failureCount,
          total_recipients: status.totalRecipients
        };
        console.log('Analytics metadata:', analyticsData);

        const logResult = await logAnalyticsEvent(
          communityId,
          'notification_sent',
          null,
          analyticsData,
          status.successCount
        );
        console.log('Analytics log result:', logResult);
      } catch (error) {
        console.error('Failed to log analytics event. Full error:', error);
        if (error instanceof Error) {
          console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
          });
        }
      }

      console.log('=== Finished broadcast ===');
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
