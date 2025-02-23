
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BroadcastMessage {
  message: string;
  filterType: 'all' | 'active' | 'expired' | 'plan';
  subscriptionPlanId?: string;
  includeButton?: boolean;
}

export const useBroadcast = (communityId: string) => {
  return useMutation({
    mutationFn: async (data: BroadcastMessage) => {
      const { error } = await supabase.functions.invoke('telegram-webhook', {
        body: {
          communityId,
          path: '/broadcast',
          ...data
        }
      });

      if (error) throw error;

      toast.success('Broadcast message sent successfully');
      return true;
    }
  });
};
