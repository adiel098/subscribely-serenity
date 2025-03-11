
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * Log a join request event
 */
export async function logJoinRequestEvent(
  supabase: ReturnType<typeof createClient>,
  chatId: string,
  userId: string,
  username: string | undefined,
  eventType: string,
  details: string,
  rawData?: any
): Promise<void> {
  try {
    console.log(`[LOG-HELPER] 📝 Logging join request event: ${eventType} for user ${userId}`);
    
    const { error } = await supabase
      .from('telegram_join_request_logs')
      .insert({
        telegram_chat_id: chatId,
        telegram_user_id: userId,
        telegram_username: username,
        event_type: eventType,
        details: details,
        raw_data: rawData
      });
    
    if (error) {
      console.error('[LOG-HELPER] ❌ Error logging join request event:', error);
    } else {
      console.log('[LOG-HELPER] ✅ Join request event logged successfully');
    }
  } catch (error) {
    console.error('[LOG-HELPER] ❌ Error in logJoinRequestEvent:', error);
  }
}

/**
 * Log a membership change event
 */
export async function logMembershipChange(
  supabase: ReturnType<typeof createClient>,
  chatId: string,
  userId: string,
  username: string | undefined,
  eventType: string,
  details: string,
  rawData?: any
): Promise<void> {
  try {
    console.log(`[LOG-HELPER] 📝 Logging membership change: ${eventType} for user ${userId}`);
    
    const { error } = await supabase
      .from('telegram_membership_logs')
      .insert({
        telegram_chat_id: chatId,
        telegram_user_id: userId,
        telegram_username: username,
        event_type: eventType,
        details: details,
        raw_data: rawData
      });
    
    if (error) {
      console.error('[LOG-HELPER] ❌ Error logging membership change:', error);
    } else {
      console.log('[LOG-HELPER] ✅ Membership change logged successfully');
    }
  } catch (error) {
    console.error('[LOG-HELPER] ❌ Error in logMembershipChange:', error);
  }
}

/**
 * Log a payment event
 */
export async function logPaymentEvent(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  communityId: string,
  eventType: string,
  details: string,
  amount?: number,
  paymentMethod?: string
): Promise<void> {
  try {
    console.log(`[LOG-HELPER] 📝 Logging payment event: ${eventType} for user ${userId}`);
    
    const { error } = await supabase
      .from('telegram_payment_logs')
      .insert({
        telegram_user_id: userId,
        community_id: communityId,
        event_type: eventType,
        details: details,
        amount: amount,
        payment_method: paymentMethod
      });
    
    if (error) {
      console.error('[LOG-HELPER] ❌ Error logging payment event:', error);
    } else {
      console.log('[LOG-HELPER] ✅ Payment event logged successfully');
    }
  } catch (error) {
    console.error('[LOG-HELPER] ❌ Error in logPaymentEvent:', error);
  }
}

/**
 * Log user interaction with the bot
 */
export async function logUserInteraction(
  supabase: ReturnType<typeof createClient>,
  eventType: string,
  userId: string,
  username: string | undefined,
  details: string,
  rawData?: any
): Promise<void> {
  try {
    console.log(`[LOG-HELPER] 📝 Logging user interaction: ${eventType} for user ${userId}`);
    
    const { error } = await supabase
      .from('telegram_user_interactions')
      .insert({
        telegram_user_id: userId,
        telegram_username: username,
        event_type: eventType,
        details: details,
        raw_data: rawData
      });
    
    if (error) {
      console.error('[LOG-HELPER] ❌ Error logging user interaction:', error);
    } else {
      console.log('[LOG-HELPER] ✅ User interaction logged successfully');
    }
  } catch (error) {
    console.error('[LOG-HELPER] ❌ Error in logUserInteraction:', error);
  }
}

/**
 * Update member activity timestamp
 * This function is fixed to not use UUID format for Telegram IDs
 */
export async function updateMemberActivity(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<void> {
  try {
    console.log(`[LOG-HELPER] 🔄 Updating activity for Telegram user ${userId}`);
    
    // Only update telegram-specific tables, not profiles
    // Update telegram_chat_members table which uses telegram_user_id as string
    const { error: memberError } = await supabase
      .from('telegram_chat_members')
      .update({ last_active: new Date().toISOString() })
      .eq('telegram_user_id', userId);
      
    if (memberError && memberError.code !== 'PGRST116') { // Ignore if no rows updated
      console.error('[LOG-HELPER] ❌ Error updating telegram_chat_members:', memberError);
    } else {
      console.log('[LOG-HELPER] ✅ telegram_chat_members activity updated successfully');
    }
    
    // Also update telegram_mini_app_users table
    const { error: miniAppError } = await supabase
      .from('telegram_mini_app_users')
      .update({ last_active: new Date().toISOString() })
      .eq('telegram_id', userId);
      
    if (miniAppError && miniAppError.code !== 'PGRST116') { // Ignore if no rows updated
      console.error('[LOG-HELPER] ❌ Error updating telegram_mini_app_users:', miniAppError);
    } else {
      console.log('[LOG-HELPER] ✅ telegram_mini_app_users activity updated successfully');
    }
  } catch (error) {
    console.error('[LOG-HELPER] ❌ Error in updateMemberActivity:', error);
  }
}
