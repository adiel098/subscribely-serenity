
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

/**
 * Fetches community by ID
 */
export const getCommunityById = async (supabase: ReturnType<typeof createClient>, communityId: string) => {
  console.log(`Fetching community: ${communityId}`);
  
  const { data: community, error } = await supabase
    .from('communities')
    .select('id, name, telegram_chat_id, is_group')
    .eq('id', communityId)
    .maybeSingle();
  
  if (error) {
    console.error(`Error fetching community ${communityId}:`, error);
    throw new Error(`Database error: ${error.message}`);
  }
  
  if (!community) {
    console.error(`Community not found: ${communityId}`);
    throw new Error(`Community not found with ID: ${communityId}`);
  }
  
  return community;
};

/**
 * Gets the most recent invite link for a community from subscription_payments
 */
export const getLatestInviteLink = async (
  supabase: ReturnType<typeof createClient>, 
  communityId: string
) => {
  console.log(`Fetching latest invite link for community ${communityId}`);
  
  const { data: payment, error } = await supabase
    .from('subscription_payments')
    .select('invite_link')
    .eq('community_id', communityId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  
  if (error) {
    console.error(`Error fetching invite link for community ${communityId}:`, error);
    throw new Error(`Database error: ${error.message}`);
  }
  
  return payment?.invite_link || null;
};

/**
 * Stores a new invite link in subscription_payments
 */
export const storeInviteLink = async (
  supabase: ReturnType<typeof createClient>, 
  communityId: string, 
  inviteLink: string
) => {
  console.log(`Storing invite link for community ${communityId}: ${inviteLink}`);
  
  // First check if there are any existing payments for this community
  const { data: existingPayment, error: fetchError } = await supabase
    .from('subscription_payments')
    .select('id, invite_link')
    .eq('community_id', communityId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  
  if (fetchError) {
    console.error(`Error checking existing payments for community ${communityId}:`, fetchError);
    throw new Error(`Database error: ${fetchError.message}`);
  }
  
  if (existingPayment) {
    // Update the existing payment with the new invite link
    const { error: updateError } = await supabase
      .from('subscription_payments')
      .update({ invite_link: inviteLink })
      .eq('id', existingPayment.id);
      
    if (updateError) {
      console.error(`Error updating invite link for payment ${existingPayment.id}:`, updateError);
      throw new Error(`Database error: ${updateError.message}`);
    }
    
    console.log(`Successfully updated invite link for payment ${existingPayment.id}`);
    return;
  }
  
  // No existing payment found, create a placeholder payment record
  const { error: insertError } = await supabase
    .from('subscription_payments')
    .insert([{
      community_id: communityId,
      plan_id: '00000000-0000-0000-0000-000000000000', // Placeholder plan ID
      amount: 0,
      payment_method: 'placeholder',
      status: 'placeholder',
      invite_link: inviteLink
    }]);
    
  if (insertError) {
    console.error(`Error creating placeholder payment for community ${communityId}:`, insertError);
    throw new Error(`Database error: ${insertError.message}`);
  }
  
  console.log(`Successfully created placeholder payment with invite link for community ${communityId}`);
};

/**
 * Gets all channel communities for a group
 */
export const getGroupChannels = async (supabase: ReturnType<typeof createClient>, groupId: string) => {
  console.log(`Fetching channels for group: ${groupId}`);
  
  const { data: relationships, error: relError } = await supabase
    .from('community_relationships')
    .select('community_id')
    .eq('member_id', groupId)
    .eq('relationship_type', 'group');
  
  if (relError) {
    console.error(`Error fetching relationships for group ${groupId}:`, relError);
    throw new Error(`Database error: ${relError.message}`);
  }
  
  if (!relationships || relationships.length === 0) {
    console.log(`No channels found for group ${groupId}`);
    return [];
  }
  
  const communityIds = relationships.map(rel => rel.community_id);
  console.log(`Found ${communityIds.length} channel IDs for group ${groupId}`);
  
  // Get base community info
  const { data: channels, error: channelsError } = await supabase
    .from('communities')
    .select('id, name, telegram_chat_id')
    .in('id', communityIds);
  
  if (channelsError) {
    console.error(`Error fetching channel communities:`, channelsError);
    throw new Error(`Database error: ${channelsError.message}`);
  }
  
  // Enrich with invite links from subscription_payments
  if (channels && channels.length > 0) {
    const channelsWithLinks = await Promise.all(channels.map(async (channel) => {
      const inviteLink = await getLatestInviteLink(supabase, channel.id);
      return {
        ...channel,
        telegram_invite_link: inviteLink
      };
    }));
    
    console.log(`Successfully fetched ${channelsWithLinks.length} channels for group ${groupId}`);
    return channelsWithLinks;
  }
  
  console.log(`Successfully fetched ${channels?.length || 0} channels for group ${groupId}`);
  return channels || [];
};
