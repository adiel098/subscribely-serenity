
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
      console.log('Sending broadcast with params:', {
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

      // בדיקה שהתשובה תקינה ומכילה את כל השדות הנדרשים
      if (!data || typeof data.successCount !== 'number' || typeof data.totalRecipients !== 'number') {
        console.error('Invalid response from server:', data);
        throw new Error('Invalid response from server');
      }

      console.log('Broadcast response:', data);
      return data as BroadcastStatus;
    },
    onSuccess: (data) => {
      if (data.totalRecipients === 0) {
        toast.warning('No recipients found for this broadcast');
      } else {
        toast.success(
          `Successfully sent messages to ${data.successCount} out of ${data.totalRecipients} users`
        );
      }
    },
    onError: (error) => {
      console.error('Error sending broadcast:', error);
      toast.error('Error sending broadcast messages');
    }
  });
};
