
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BroadcastStatus {
  successCount: number;
  failureCount: number;
  totalRecipients: number;
}

interface BroadcastParams {
  communityId: string;
  message: string;
  targetAudience: 'all' | 'active' | 'expired';
  silent: boolean;
}

export const useBroadcast = () => {
  const mutation = useMutation({
    mutationFn: async (params: BroadcastParams): Promise<BroadcastStatus> => {
      const { data, error } = await supabase.functions.invoke('telegram-webhook', {
        body: {
          path: '/broadcast',
          message: params.message,
          filterType: params.targetAudience,
          communityId: params.communityId,
          silent: params.silent
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

  return {
    broadcast: mutation.mutate,
    isLoading: mutation.isPending
  };
};
