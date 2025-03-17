
import { logSubscriptionActivity } from "../utils/logger.ts";

/**
 * Handles creating or updating a community member
 */
export async function handleCreateOrUpdateMember(supabase, requestData) {
  const { 
    telegram_id: telegramId, 
    community_id: communityId, 
    subscription_plan_id: planId,
    status = 'active',
    is_active = true,
    payment_id,
    username,
    subscription_start_date,
    subscription_end_date
  } = requestData;
  
  console.log(`[telegram-user-manager] Creating/updating member with telegram ID: ${telegramId} in community: ${communityId}`);
  
  if (!telegramId || !communityId || !planId) {
    console.error(`[telegram-user-manager] Missing required parameters`);
    return { success: false, error: "Missing required parameters" };
  }

  try {
    // Check if member already exists
    const { data: existingMember, error: memberCheckError } = await supabase
      .from("community_subscribers")  // Changed from telegram_chat_members to community_subscribers
      .select("id")
      .eq("telegram_user_id", telegramId)
      .eq("community_id", communityId)
      .maybeSingle();
    
    if (memberCheckError) {
      console.error(`[telegram-user-manager] Error checking existing member:`, memberCheckError);
      return { success: false, error: memberCheckError.message };
    }
    
    let result;
    if (existingMember) {
      // Update existing member
      console.log(`[telegram-user-manager] Updating existing member with ID: ${existingMember.id}`);
      const { data, error } = await supabase
        .from("community_subscribers")  // Changed from telegram_chat_members to community_subscribers
        .update({
          subscription_plan_id: planId,
          subscription_status: status,
          is_active: is_active,
          telegram_username: username,
          subscription_start_date: subscription_start_date || new Date().toISOString(),
          subscription_end_date: subscription_end_date
        })
        .eq("id", existingMember.id)
        .select();
      
      if (error) {
        console.error(`[telegram-user-manager] Error updating member:`, error);
        return { success: false, error: error.message };
      }
      result = data;
    } else {
      // Create new member
      console.log(`[telegram-user-manager] Creating new member`);
      const { data, error } = await supabase
        .from("community_subscribers")  // Changed from telegram_chat_members to community_subscribers
        .insert({
          telegram_user_id: telegramId,
          telegram_username: username,
          community_id: communityId,
          subscription_plan_id: planId,
          subscription_status: status,
          is_active: is_active,
          subscription_start_date: subscription_start_date || new Date().toISOString(),
          subscription_end_date: subscription_end_date
        })
        .select();
      
      if (error) {
        console.error(`[telegram-user-manager] Error creating member:`, error);
        return { success: false, error: error.message };
      }
      result = data;
    }
    
    // If payment_id is provided, update subscription_payments if needed
    if (payment_id) {
      console.log(`[telegram-user-manager] Updating payment record: ${payment_id}`);
      const { error: paymentError } = await supabase
        .from("subscription_payments")
        .update({ status: "completed" })
        .eq("id", payment_id);
      
      if (paymentError) {
        console.error(`[telegram-user-manager] Error updating payment:`, paymentError);
        // Continue despite payment update error, the membership was created/updated
      }
    }
    
    // Log the subscription activity
    await logSubscriptionActivity(
      supabase,
      telegramId,
      communityId,
      existingMember ? 'subscription_updated' : 'subscription_created',
      existingMember ? 'Subscription updated' : 'New subscription created'
    );
    
    console.log(`[telegram-user-manager] Successfully created/updated member`);
    return { success: true, data: result };
  } catch (err) {
    console.error(`[telegram-user-manager] Error in handleCreateOrUpdateMember:`, err);
    return { success: false, error: err.message };
  }
}
