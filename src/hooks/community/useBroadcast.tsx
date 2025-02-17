
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

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(
        `Successfully sent messages to ${data.successCount} out of ${data.totalRecipients} users`
      );
    },
    onError: (error) => {
      console.error('Error sending broadcast:', error);
      toast.error('Error sending broadcast messages');
    }
  });
};
