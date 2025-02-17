
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { BroadcastStatus } from "@/types";

interface BroadcastOptions {
  message: string;
  filterType: 'all' | 'active' | 'expired';
  includeButton?: boolean;
  buttonText?: string;
  buttonUrl?: string;
}

export const useBroadcast = (communityId: string) => {
  return useMutation({
    mutationFn: async (options: BroadcastOptions): Promise<BroadcastStatus> => {
      if (!communityId) {
        throw new Error('Community ID is required');
      }

      const { data, error } = await supabase.functions.invoke('telegram-webhook', {
        body: {
          communityId,
          message: options.message,
          filterType: options.filterType,
          includeButton: options.includeButton,
          buttonText: options.buttonText,
          buttonUrl: options.buttonUrl,
          path: '/broadcast'
        }
      });

      if (error) {
        throw error;
      }

      return data as BroadcastStatus;
    },
    onSuccess: () => {
      toast.success('Message broadcasted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to broadcast message: ${error.message}`);
    }
  });
};
