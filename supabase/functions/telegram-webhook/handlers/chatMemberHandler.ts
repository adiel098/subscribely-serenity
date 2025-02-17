
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export async function handleChatMemberUpdate(
  supabase: ReturnType<typeof createClient>,
  chatMember: any
) {
  try {
    const { chat, new_chat_member, invite_link } = chatMember;
    const userId = new_chat_member.user.id.toString();
    const chatId = chat.id.toString();
    const username = new_chat_member.user.username;

    console.log('[ChatMember] Processing member update:', {
      chatId,
      userId,
      username,
      status: new_chat_member.status
    });

    if (new_chat_member.status === 'member') {
      // בדיקה אם יש תשלום פעיל עבור המשתמש
      const { data: payment, error: paymentError } = await supabase
        .from('subscription_payments')
        .select('plan_id, invite_link')
        .eq('telegram_user_id', userId)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (paymentError) {
        console.error('[ChatMember] Error fetching payment:', paymentError);
        return false;
      }

      if (!payment) {
        console.log('[ChatMember] No active payment found for user');
        return false;
      }

      // בדיקה אם קיים כבר רשומה למשתמש
      const { data: existingMember, error: memberError } = await supabase
        .from('telegram_chat_members')
        .select('*')
        .eq('telegram_user_id', userId)
        .eq('community_id', chatId)
        .maybeSingle();

      if (memberError) {
        console.error('[ChatMember] Error checking existing member:', memberError);
        return false;
      }

      const now = new Date();
      const subscriptionEndDate = new Date();
      subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1); // מנוי לחודש כברירת מחדל

      if (existingMember) {
        // עדכון חבר קיים
        console.log('[ChatMember] Updating existing member:', existingMember.id);
        const { error: updateError } = await supabase
          .from('telegram_chat_members')
          .update({
            is_active: true,
            subscription_status: true,
            subscription_plan_id: payment.plan_id,
            subscription_start_date: now.toISOString(),
            subscription_end_date: subscriptionEndDate.toISOString(),
            telegram_username: username
          })
          .eq('id', existingMember.id);

        if (updateError) {
          console.error('[ChatMember] Error updating member:', updateError);
          return false;
        }
      } else {
        // יצירת חבר חדש
        console.log('[ChatMember] Creating new member');
        const { error: insertError } = await supabase
          .from('telegram_chat_members')
          .insert({
            community_id: chatId,
            telegram_user_id: userId,
            telegram_username: username,
            is_active: true,
            subscription_status: true,
            subscription_plan_id: payment.plan_id,
            subscription_start_date: now.toISOString(),
            subscription_end_date: subscriptionEndDate.toISOString()
          });

        if (insertError) {
          console.error('[ChatMember] Error inserting new member:', insertError);
          return false;
        }
      }

      return true;
    }

    return false;
  } catch (error) {
    console.error('[ChatMember] Error:', error);
    return false;
  }
}
