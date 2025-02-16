
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
      filterType 
    }: { 
      message: string; 
      filterType?: 'all' | 'subscribed' 
    }): Promise<BroadcastStatus> => {
      const { data, error } = await supabase.functions.invoke('telegram-webhook', {
        body: {
          communityId,
          path: '/broadcast',
          message,
          filterType
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(
        `הודעה נשלחה בהצלחה ל-${data.successCount} מתוך ${data.totalRecipients} משתמשים`
      );
    },
    onError: (error) => {
      console.error('Error sending broadcast:', error);
      toast.error('שגיאה בשליחת ההודעה');
    }
  });
};
