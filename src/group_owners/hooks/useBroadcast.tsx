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

      const { data: settings, error: settingsError } = await supabase
        .from('telegram_global_settings')
        .select('bot_token')
        .single();

      if (settingsError || !settings?.bot_token) {
        console.error('Error fetching bot token:', settingsError);
        throw new Error('Bot token not found');
      }

      let successCount = 0;
      let failureCount = 0;

      // שליחת הודעות בצורה סדרתית
      for (const member of activeMembers) {
        try {
          const response = await fetch(`https://api.telegram.org/bot${settings.bot_token}/sendMessage`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              chat_id: member.telegram_user_id,
              text: message,
              parse_mode: 'HTML'
            }),
          });

          const result = await response.json();
          console.log(`Message sent to ${member.telegram_username || member.telegram_user_id}:`, result);

          if (result.ok) {
            successCount++;
          } else {
            failureCount++;
            console.error(`Failed to send message to ${member.telegram_username || member.telegram_user_id}:`, result);
          }

          // להוסיף השהייה קטנה בין הודעות כדי להימנע מחסימה
          await new Promise(resolve => setTimeout(resolve, 35));
        } catch (error) {
          console.error(`Error sending message to ${member.telegram_username || member.telegram_user_id}:`, error);
          failureCount++;
        }
      }

      const status: BroadcastStatus = {
        successCount,
        failureCount,
        totalRecipients: activeMembers.length
      };

      // בדיקה שבאמת היו הצלחות בשליחה
      if (status.successCount === 0 && status.totalRecipients > 0) {
        throw new Error('לא הצלחנו לשלוח את ההודעה לאף משתמש');
      }

      console.log('Broadcast completed with status:', status);
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
