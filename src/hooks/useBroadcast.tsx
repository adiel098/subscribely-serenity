
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

      const { data: broadcastResult, error } = await supabase.functions.invoke('telegram-webhook', {
        body: {
          type: 'broadcast',
          communityId,
          message,
          filterType,
          subscriptionPlanId,
          includeButton,
          recipients: activeMembers.map(member => ({
            userId: member.telegram_user_id,
            username: member.telegram_username
          }))
        }
      });

      console.log('Raw response from server:', broadcastResult);

      if (error) {
        console.error('Broadcast error:', error);
        throw error;
      }

      if (!broadcastResult) {
        console.error('No response data received');
        throw new Error('No response data received');
      }

      if (!('successCount' in broadcastResult) || !('failureCount' in broadcastResult)) {
        console.error('Invalid response format:', broadcastResult);
        throw new Error('השליחה נכשלה - בעיה בתקשורת עם הבוט');
      }

      const status: BroadcastStatus = {
        successCount: Number(broadcastResult.successCount) || 0,
        failureCount: Number(broadcastResult.failureCount) || 0,
        totalRecipients: activeMembers.length
      };

      // בדיקה שבאמת היו הצלחות בשליחה
      if (status.successCount === 0) {
        throw new Error('לא הצלחנו לשלוח את ההודעה לאף משתמש');
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
      toast.error(error instanceof Error ? error.message : 'שגיאה בשליחת ההודעות');
    }
  });
};
