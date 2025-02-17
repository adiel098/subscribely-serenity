
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

      const response = await supabase.functions.invoke('telegram-webhook', {
        body: {
          communityId,
          path: '/broadcast',
          message,
          filterType,
          subscriptionPlanId,
          includeButton
        }
      });

      if (response.error) {
        console.error('Broadcast error:', response.error);
        throw response.error;
      }

      const responseData = response.data;
      console.log('Raw broadcast response:', responseData);

      // בדיקה מורחבת של התשובה
      if (!responseData) {
        console.error('No response data received');
        throw new Error('No response data received');
      }

      // נסה לחלץ את השדות הנדרשים מהתשובה
      const status: BroadcastStatus = {
        successCount: Number(responseData.successCount) || 0,
        failureCount: Number(responseData.failureCount) || 0,
        totalRecipients: Number(responseData.totalRecipients) || 0
      };

      // וודא שהערכים תקינים
      if (isNaN(status.successCount) || isNaN(status.failureCount) || isNaN(status.totalRecipients)) {
        console.error('Invalid response format:', responseData);
        throw new Error('Invalid response format');
      }

      console.log('Processed broadcast response:', status);
      return status;
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
