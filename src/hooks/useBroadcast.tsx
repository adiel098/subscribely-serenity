
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
      console.log('Starting broadcast with params:', {
        communityId,
        message,
        filterType,
        subscriptionPlanId,
        includeButton
      });

      const { data, error } = await supabase.functions.invoke('telegram-webhook', {
        body: {
          communityId,
          path: '/broadcast',
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

      if (!data || typeof data.successCount !== 'number' || typeof data.totalRecipients !== 'number') {
        console.error('Invalid response format:', data);
        throw new Error('Invalid response from server');
      }

      console.log('Broadcast response:', data);
      return {
        successCount: data.successCount,
        failureCount: data.failureCount || 0,
        totalRecipients: data.totalRecipients
      };
    },
    onSuccess: (data) => {
      if (!data.totalRecipients) {
        toast.warning('No recipients found matching the selected criteria');
        return;
      }
      
      toast.success(
        `Successfully sent messages to ${data.successCount || 0} out of ${data.totalRecipients} users`
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
