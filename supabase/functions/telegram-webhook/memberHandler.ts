
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export async function findOrCreateMember(
  supabase: ReturnType<typeof createClient>,
  communityId: string,
  memberId: string,
  username: string,
  subscription: {
    subscriptionStartDate: Date;
    subscriptionEndDate: Date | null;
    subscriptionPlanId: string | null;
  } | null
) {
  const memberData = {
    telegram_username: username,
    is_active: true,
    last_active: new Date().toISOString(),
    subscription_status: Boolean(subscription),
    subscription_plan_id: subscription?.subscriptionPlanId,
    subscription_start_date: subscription?.subscriptionStartDate.toISOString(),
    subscription_end_date: subscription?.subscriptionEndDate?.toISOString() || null
  };

  const { data: existingMember, error: memberCheckError } = await supabase
    .from('telegram_chat_members')
    .select('id')
    .eq('community_id', communityId)
    .eq('telegram_user_id', memberId)
    .maybeSingle();
    
  if (memberCheckError) {
    console.error('Error checking existing member:', memberCheckError);
    throw memberCheckError;
  }
  
  if (existingMember) {
    console.log('Member already exists, updating with:', memberData);
    const { error: updateError } = await supabase
      .from('telegram_chat_members')
      .update(memberData)
      .eq('id', existingMember.id);
      
    if (updateError) {
      console.error('Error updating member:', updateError);
      throw updateError;
    }
  } else {
    console.log('Creating new member with:', memberData);
    const { error: insertError } = await supabase
      .from('telegram_chat_members')
      .insert([{
        community_id: communityId,
        telegram_user_id: memberId,
        joined_at: new Date().toISOString(),
        ...memberData
      }]);
      
    if (insertError) {
      console.error('Error inserting member:', insertError);
      throw insertError;
    }
  }

  return memberData;
}

export async function deactivateMember(
  supabase: ReturnType<typeof createClient>,
  communityId: string,
  memberId: string
) {
  const { error: updateError } = await supabase
    .from('telegram_chat_members')
    .update({
      is_active: false,
      subscription_status: false,
      subscription_end_date: new Date().toISOString()
    })
    .eq('community_id', communityId)
    .eq('telegram_user_id', memberId);
    
  if (updateError) {
    console.error('Error updating member status:', updateError);
    throw updateError;
  }
}
