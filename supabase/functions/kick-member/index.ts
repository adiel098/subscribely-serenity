
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { corsHeaders } from "../_shared/cors.ts";

// Create a logger function
async function logToDb(supabase, level, message, metadata = {}) {
  try {
    await supabase
      .from('system_logs')
      .insert({
        event_type: 'KICK_MEMBER',
        details: `[${level.toUpperCase()}] ${message}`,
        metadata
      });
  } catch (error) {
    console.error('Error logging to database:', error);
  }
}

// Get the community's Telegram chat ID
async function getTelegramChatId(supabase, communityId) {
  try {
    const { data, error } = await supabase
      .from('communities')
      .select('telegram_chat_id')
      .eq('id', communityId)
      .single();
      
    if (error) throw error;
    return data.telegram_chat_id;
  } catch (error) {
    console.error('Error getting Telegram chat ID:', error);
    throw error;
  }
}

// Kick a member from a Telegram chat
async function kickMember(supabase, chatId, userId, botToken) {
  const logger = {
    info: (msg) => console.log(`[KICK-MEMBER] info: ${msg}`),
    error: (msg) => console.error(`[KICK-MEMBER] error: ${msg}`),
    success: (msg) => console.log(`[KICK-MEMBER] success: ${msg}`)
  };
  
  try {
    await logToDb(supabase, 'info', `Request to kick member ${userId} from chat ${chatId}`);
    
    // If the chatId is a UUID, it's a community ID, so resolve to the actual telegram_chat_id
    if (chatId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      logger.info(`Resolved community ID ${chatId} to Telegram chat ID`);
      chatId = await getTelegramChatId(supabase, chatId);
      logger.info(`Resolved community ID to Telegram chat ID ${chatId}`);
    }
    
    // Call the member removal service
    const memberRemovalService = new MemberRemovalService(supabase);
    const result = await memberRemovalService.removeManually(chatId, userId, botToken);
    
    return result;
  } catch (error) {
    logger.error(`Error in kick member function: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Class to handle member removal
class MemberRemovalService {
  private supabase;
  
  constructor(supabase) {
    this.supabase = supabase;
  }
  
  async removeManually(chatId, telegramUserId, botToken) {
    try {
      console.log(`[MEMBER-REMOVAL-SERVICE] info: Manual removal initiated for user ${telegramUserId} from chat ${chatId}`);
      
      // 1. First try to kick the member from Telegram
      const telegramApi = new TelegramApi(botToken);
      const kickResult = await telegramApi.kickChatMember(chatId, telegramUserId);
      
      // 2. Get community ID for updating records
      const { data: community, error: communityError } = await this.supabase
        .from('communities')
        .select('id')
        .eq('telegram_chat_id', chatId)
        .single();
        
      if (communityError) {
        console.error(`Error finding community: ${communityError.message}`);
        return {
          success: false,
          telegramSuccess: kickResult.success,
          error: `Database error: ${communityError.message}`
        };
      }
      
      const communityId = community.id;
      
      // 3. Invalidate any invite links for this user
      console.log(`[MEMBER-REMOVAL-SERVICE] info: Invalidating invite links for user ${telegramUserId} in community ${communityId}`);
      
      const { error: inviteError } = await this.supabase
        .from('subscription_payments')
        .update({ invite_link: null })
        .eq('telegram_user_id', telegramUserId)
        .eq('community_id', communityId);
        
      if (inviteError) {
        console.warn(`Error invalidating invite links: ${inviteError.message}`);
      }
      
      // 4. Find the subscriber record by telegram_user_id
      const { data: subscriber, error: subscriberError } = await this.supabase
        .from('community_subscribers')
        .select('id')
        .eq('telegram_user_id', telegramUserId)
        .eq('community_id', communityId)
        .single();
        
      if (subscriberError) {
        console.error(`Error finding subscriber: ${subscriberError.message}`);
        return {
          success: false,
          telegramSuccess: kickResult.success,
          error: `Database error: ${subscriberError.message}`
        };
      }
      
      // 5. Update the subscriber status in the database
      console.log(`[MEMBER-REMOVAL-SERVICE] info: Updating subscriber record ${subscriber.id} to status "removed"`);
      
      const { error: updateError } = await this.supabase
        .from('community_subscribers')
        .update({
          is_active: false,
          subscription_status: 'removed'
        })
        .eq('id', subscriber.id);
        
      if (updateError) {
        console.error(`Error updating subscriber: ${updateError.message}`);
        return {
          success: false,
          telegramSuccess: kickResult.success,
          error: `Database error: ${updateError.message}`
        };
      }
      
      // 6. Log the activity
      await this.supabase
        .from('subscription_activity_logs')
        .insert({
          telegram_user_id: telegramUserId,
          community_id: communityId,
          activity_type: 'member_removed',
          details: 'Member manually removed from community by admin',
          status: 'removed'
        });
      
      // Return success with info about the Telegram operation
      return {
        success: true,
        telegramSuccess: kickResult.success,
        error: kickResult.success ? undefined : kickResult.error
      };
    } catch (error) {
      console.error(`Error in removeManually: ${error.message}`);
      return {
        success: false,
        telegramSuccess: false,
        error: error.message
      };
    }
  }
}

// Helper class for Telegram API operations
class TelegramApi {
  private botToken;
  
  constructor(botToken) {
    this.botToken = botToken;
  }
  
  async kickChatMember(chatId, userId) {
    try {
      console.log(`[TelegramApi] Attempting to kick user ${userId} from chat ${chatId}`);
      
      // First ban the user (kick)
      const kickUrl = `https://api.telegram.org/bot${this.botToken}/banChatMember`;
      const kickResponse = await fetch(kickUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          user_id: userId,
          until_date: Math.floor(Date.now() / 1000) + 40 // Ban for 40 seconds (minimum allowed)
        })
      });
      
      const kickResult = await kickResponse.json();
      
      if (kickResult.ok) {
        console.log(`[TelegramApi] Successfully kicked user ${userId}`);
      } else {
        console.error(`[TelegramApi] Error kicking user: ${kickResult.description}`);
        return { success: false, error: kickResult.description };
      }
      
      // Wait 2 seconds before unbanning
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Then unban the user so they can rejoin with a new invite link
      console.log(`[TelegramApi] Now unbanning user ${userId} so they can rejoin in the future with a new invite link`);
      
      const unbanUrl = `https://api.telegram.org/bot${this.botToken}/unbanChatMember`;
      const unbanResponse = await fetch(unbanUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          user_id: userId,
          only_if_banned: true
        })
      });
      
      const unbanResult = await unbanResponse.json();
      
      if (unbanResult.ok) {
        console.log(`[TelegramApi] Successfully unbanned user ${userId}`);
      } else {
        console.warn(`[TelegramApi] Error unbanning user: ${unbanResult.description}`);
      }
      
      return { success: true };
    } catch (error) {
      console.error(`[TelegramApi] Error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Parse the request body
    const { member_id, telegram_user_id, chat_id, bot_token } = await req.json();
    
    if (!telegram_user_id || !chat_id || !bot_token) {
      throw new Error('Missing required parameters: telegram_user_id, chat_id, or bot_token');
    }
    
    // Call the kick member function
    const result = await kickMember(supabase, chat_id, telegram_user_id, bot_token);
    
    // Return the result
    return new Response(JSON.stringify({
      success: result.success,
      telegram_success: result.telegramSuccess,
      error: result.error
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
