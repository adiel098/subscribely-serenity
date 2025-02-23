
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BroadcastOptions {
  message: string;
  filterType: 'all' | 'active' | 'expired' | 'plan';
  subscriptionPlanId?: string;
  includeButton?: boolean;
}

export const useBroadcast = (communityId: string) => {
  return useMutation({
    mutationFn: async (options: BroadcastOptions) => {
      const { error } = await supabase.functions.invoke('telegram-webhook', {
        body: {
          communityId,
          path: '/broadcast',
          ...options
        }
      });

      if (error) throw error;

      toast.success('Broadcast sent successfully');
    },
    onError: (error: Error) => {
      console.error('Error sending broadcast:', error);
      toast.error('Failed to send broadcast');
    }
  });
};
