
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface BroadcastResult {
  successCount: number;
  failureCount: number;
  totalRecipients: number;
}

export async function sendBroadcast(
  supabase: ReturnType<typeof createClient>,
  communityId: string,
  message: string,
  filterType: 'all' | 'active' | 'expired' | 'plan',
  subscriptionPlanId?: string
): Promise<BroadcastResult> {
  try {
    console.log('[Broadcast] Starting broadcast');

    const query = supabase
      .from('telegram_chat_members')
      .select('*')
      .eq('community_id', communityId)
      .eq('is_active', true);

    if (filterType === 'active') {
      query.eq('subscription_status', true);
    } else if (filterType === 'expired') {
      query.eq('subscription_status', false);
    } else if (filterType === 'plan' && subscriptionPlanId) {
      query.eq('subscription_plan_id', subscriptionPlanId);
    }

    const { data: members, error } = await query;

    if (error || !members?.length) {
      console.log('[Broadcast] No recipients found');
      return { successCount: 0, failureCount: 0, totalRecipients: 0 };
    }

    const { data: settings } = await supabase
      .from('telegram_global_settings')
      .select('bot_token')
      .single();

    if (!settings?.bot_token) {
      throw new Error('Bot token not found');
    }

    let successCount = 0;
    let failureCount = 0;

    for (const member of members) {
      try {
        const response = await fetch(`https://api.telegram.org/bot${settings.bot_token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: member.telegram_user_id,
            text: message,
            parse_mode: 'HTML'
          }),
        });

        const result = await response.json();
        if (result.ok) {
          successCount++;
        } else {
          failureCount++;
        }

        // להימנע מחסימה של טלגרם
        await new Promise(resolve => setTimeout(resolve, 35));
      } catch (error) {
        console.error('[Broadcast] Error sending message:', error);
        failureCount++;
      }
    }

    return {
      successCount,
      failureCount,
      totalRecipients: members.length
    };
  } catch (error) {
    console.error('[Broadcast] Error:', error);
    throw error;
  }
}
