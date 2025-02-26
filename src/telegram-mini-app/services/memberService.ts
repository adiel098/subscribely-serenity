
import { supabase } from "@/integrations/supabase/client";
import { CreateMemberData } from "../types/payment.types";

export const createOrUpdateMember = async (data: CreateMemberData) => {
  const { telegramUserId, communityId, planId, subscriptionStartDate, subscriptionEndDate } = data;

  console.log('Creating/updating member:', {
    telegramUserId,
    communityId: communityId,
    planId: planId
  });

  const { data: existingMember } = await supabase
    .from('telegram_chat_members')
    .select('*')
    .eq('community_id', communityId)
    .eq('telegram_user_id', telegramUserId)
    .single();

  if (existingMember) {
    const { error: updateError } = await supabase
      .from('telegram_chat_members')
      .update({
        is_active: true,
        subscription_status: true,
        subscription_start_date: subscriptionStartDate.toISOString(),
        subscription_end_date: subscriptionEndDate.toISOString(),
        subscription_plan_id: planId,
        last_active: new Date().toISOString()
      })
      .eq('id', existingMember.id);

    if (updateError) {
      console.error('Error updating member:', updateError);
      throw updateError;
    }
  } else {
    const { error: insertError } = await supabase
      .from('telegram_chat_members')
      .insert([{
        community_id: communityId,
        telegram_user_id: telegramUserId,
        is_active: true,
        subscription_status: true,
        subscription_start_date: subscriptionStartDate.toISOString(),
        subscription_end_date: subscriptionEndDate.toISOString(),
        subscription_plan_id: planId,
        last_active: new Date().toISOString()
      }]);

    if (insertError) {
      console.error('Error creating member:', insertError);
      throw insertError;
    }
  }
};
