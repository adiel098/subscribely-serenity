
import { supabase } from "@/integrations/supabase/client";
import { CreateMemberData } from "../types/payment.types";

/**
 * Create or update a community member based on Telegram user ID
 * This function handles connecting a payment to a Telegram user
 */
export const createOrUpdateMember = async (data: CreateMemberData) => {
  try {
    const { 
      community_id, 
      telegram_id, 
      subscription_plan_id, 
      status = 'active',
      payment_id 
    } = data;
    
    if (!telegram_id || !community_id) {
      throw new Error("Telegram ID and Community ID are required");
    }

    console.log('Creating/updating member:', {
      telegram_id,
      community_id,
      subscription_plan_id,
      status
    });

    // First, check if the member already exists
    const { data: existingMember, error: queryError } = await supabase
      .from('community_members')
      .select('*')
      .eq('community_id', community_id)
      .eq('telegram_id', telegram_id)
      .maybeSingle();
      
    if (queryError) {
      console.error('Error checking for existing member:', queryError);
      throw queryError;
    }
    
    const now = new Date();
    // Default subscription period - 30 days from now
    const defaultEndDate = new Date();
    defaultEndDate.setDate(now.getDate() + 30); 

    if (existingMember) {
      // Update existing member
      const { error: updateError } = await supabase
        .from('community_members')
        .update({
          status: status,
          subscription_plan_id: subscription_plan_id,
          subscription_start_date: now.toISOString(),
          subscription_end_date: defaultEndDate.toISOString(),
          updated_at: now.toISOString(),
          payment_id: payment_id || existingMember.payment_id
        })
        .eq('id', existingMember.id);

      if (updateError) {
        console.error('Error updating member:', updateError);
        throw updateError;
      }
      
      return { id: existingMember.id, updated: true };
    } else {
      // Create new member
      const { data: newMember, error: insertError } = await supabase
        .from('community_members')
        .insert({
          community_id: community_id,
          telegram_id: telegram_id,
          status: status,
          subscription_plan_id: subscription_plan_id,
          subscription_start_date: now.toISOString(),
          subscription_end_date: defaultEndDate.toISOString(),
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
          payment_id: payment_id
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating member:', insertError);
        throw insertError;
      }
      
      return { id: newMember.id, updated: false };
    }
  } catch (error) {
    console.error('Error in createOrUpdateMember:', error);
    throw error;
  }
};

/**
 * Alias for createOrUpdateMember to maintain compatibility with existing code
 */
export const createMember = createOrUpdateMember;

/**
 * Fetch all user subscriptions across communities
 */
export const getUserSubscriptions = async (telegramUserId: string) => {
  try {
    console.log('Fetching subscriptions for user:', telegramUserId);
    
    const { data, error } = await supabase
      .from('community_members')
      .select(`
        *,
        community:communities(id, name, description, telegram_photo_url, telegram_invite_link),
        plan:subscription_plans(id, name, price, interval, features)
      `)
      .eq('telegram_id', telegramUserId)
      .order('subscription_end_date', { ascending: false });
    
    if (error) {
      console.error('Error fetching user subscriptions:', error);
      throw error;
    }
    
    console.log(`Found ${data?.length || 0} subscriptions for user ${telegramUserId}`);
    return data || [];
  } catch (error) {
    console.error('Error in getUserSubscriptions:', error);
    throw error;
  }
};

/**
 * Cancel a user's subscription to a community
 */
export const cancelSubscription = async (memberId: string) => {
  try {
    console.log('Cancelling subscription for member:', memberId);
    
    const now = new Date();
    
    const { data, error } = await supabase
      .from('community_members')
      .update({
        status: 'cancelled',
        updated_at: now.toISOString(),
      })
      .eq('id', memberId)
      .select()
      .single();
    
    if (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
    
    console.log('Successfully cancelled subscription:', data);
    return data;
  } catch (error) {
    console.error('Error in cancelSubscription:', error);
    throw error;
  }
};

/**
 * Fetch available communities for search/discovery
 */
export const searchCommunities = async (query: string = '') => {
  try {
    console.log('Searching communities with query:', query);
    
    let searchQuery = supabase
      .from('communities')
      .select(`
        id,
        name,
        description,
        telegram_photo_url,
        telegram_invite_link,
        member_count,
        subscription_plans(id, name, price, interval)
      `)
      .limit(20);
    
    // Add search filter if query provided
    if (query && query.trim()) {
      searchQuery = searchQuery.ilike('name', `%${query.trim()}%`);
    }
    
    const { data, error } = await searchQuery;
    
    if (error) {
      console.error('Error searching communities:', error);
      throw error;
    }
    
    console.log(`Found ${data?.length || 0} communities matching query "${query}"`);
    return data || [];
  } catch (error) {
    console.error('Error in searchCommunities:', error);
    throw error;
  }
};
