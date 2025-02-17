
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
      // בדיקת משתמשים פעילים לפני שליחת הברודקאסט
      const { data: activeMembers, error: membersError } = await supabase
        .from('telegram_chat_members')
        .select('*')
        .eq('community_id', communityId)
        .eq('is_active', true);

      if (membersError) {
        console.error('Error checking active members:', membersError);
        throw membersError;
      }

      console.log('Active members found:', {
        totalActive: activeMembers?.length || 0,
        members: activeMembers
      });

      // אם אין משתמשים פעילים, נחזיר מיד תשובה מתאימה
      if (!activeMembers || activeMembers.length === 0) {
        return {
          successCount: 0,
          failureCount: 0,
          totalRecipients: 0
        };
      }

      console.log('Sending broadcast with params:', {
        communityId,
        message,
        filterType,
        subscriptionPlanId,
        includeButton,
        activeUsersCount: activeMembers.length
      });

      const response = await supabase.functions.invoke('telegram-webhook', {
        body: {
          type: 'broadcast',  // הוספת type במקום path
          communityId,
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

      if (!responseData) {
        console.error('No response data received');
        throw new Error('No response data received');
      }

      const status: BroadcastStatus = {
        successCount: Number(responseData.successCount) || 0,
        failureCount: Number(responseData.failureCount) || 0,
        totalRecipients: Number(responseData.totalRecipients) || 0
      };

      if (isNaN(status.successCount) || isNaN(status.failureCount) || isNaN(status.totalRecipients)) {
        console.error('Invalid response format:', responseData);
        throw new Error('Invalid response format');
      }

      console.log('Processed broadcast response:', status);
      return status;
    },
    onSuccess: (data) => {
      if (data.totalRecipients === 0) {
        toast.warning('לא נמצאו משתמשים פעילים לשליחת ההודעה');
      } else {
        toast.success(
          `ההודעה נשלחה בהצלחה ל-${data.successCount} מתוך ${data.totalRecipients} משתמשים`
        );
      }
    },
    onError: (error) => {
      console.error('Error sending broadcast:', error);
      toast.error('שגיאה בשליחת ההודעות');
    }
  });
};
