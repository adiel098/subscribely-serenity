
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

    console.log('🔍 [ChatMember] Full update data:', JSON.stringify(chatMember, null, 2));
    console.log('👤 [ChatMember] Processing member:', {
      chatId,
      userId,
      username,
      status: new_chat_member.status
    });

    if (new_chat_member.status === 'member') {
      // בדיקה אם יש תשלום פעיל עבור המשתמש
      console.log('💳 [ChatMember] Checking for active payment...');
      const { data: payments, error: paymentError } = await supabase
        .from('subscription_payments')
        .select('*')
        .eq('telegram_user_id', userId)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(1);

      if (paymentError) {
        console.error('❌ [ChatMember] Error fetching payment:', paymentError);
        return false;
      }

      console.log('💰 [ChatMember] Found payments:', JSON.stringify(payments, null, 2));

      if (!payments || payments.length === 0) {
        console.log('⚠️ [ChatMember] No active payment found for user:', userId);
        return false;
      }

      const latestPayment = payments[0];
      
      // בדיקה אם קיים כבר רשומה למשתמש
      console.log('🔍 [ChatMember] Checking for existing member...');
      const { data: members, error: memberError } = await supabase
        .from('telegram_chat_members')
        .select('*')
        .eq('telegram_user_id', userId)
        .eq('community_id', chatId);

      if (memberError) {
        console.error('❌ [ChatMember] Error checking existing member:', memberError);
        return false;
      }

      console.log('📋 [ChatMember] Found members:', JSON.stringify(members, null, 2));

      const now = new Date();
      const subscriptionEndDate = new Date();
      subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);

      const existingMember = members && members.length > 0 ? members[0] : null;

      if (existingMember) {
        // עדכון חבר קיים
        console.log('📝 [ChatMember] Updating existing member:', existingMember.id);
        const updateData = {
          is_active: true,
          subscription_status: true,
          subscription_plan_id: latestPayment.plan_id,
          subscription_start_date: now.toISOString(),
          subscription_end_date: subscriptionEndDate.toISOString(),
          telegram_username: username,
          last_active: now.toISOString()
        };
        
        console.log('🔄 [ChatMember] Update data:', JSON.stringify(updateData, null, 2));
        
        const { data: updateResult, error: updateError } = await supabase
          .from('telegram_chat_members')
          .update(updateData)
          .eq('id', existingMember.id)
          .select();

        if (updateError) {
          console.error('❌ [ChatMember] Error updating member:', updateError);
          return false;
        }

        console.log('✅ [ChatMember] Member updated successfully:', JSON.stringify(updateResult, null, 2));
      } else {
        // יצירת חבר חדש
        console.log('➕ [ChatMember] Creating new member record');
        const insertData = {
          community_id: chatId,
          telegram_user_id: userId,
          telegram_username: username,
          is_active: true,
          subscription_status: true,
          subscription_plan_id: latestPayment.plan_id,
          subscription_start_date: now.toISOString(),
          subscription_end_date: subscriptionEndDate.toISOString(),
          last_active: now.toISOString()
        };

        console.log('📥 [ChatMember] Insert data:', JSON.stringify(insertData, null, 2));

        const { data: insertResult, error: insertError } = await supabase
          .from('telegram_chat_members')
          .insert(insertData)
          .select();

        if (insertError) {
          console.error('❌ [ChatMember] Error inserting new member:', insertError);
          return false;
        }

        console.log('✅ [ChatMember] New member created successfully:', JSON.stringify(insertResult, null, 2));
      }

      return true;
    }

    console.log('ℹ️ [ChatMember] Member status is not "member":', new_chat_member.status);
    return false;
  } catch (error) {
    console.error('💥 [ChatMember] Unexpected error:', error);
    return false;
  }
}
