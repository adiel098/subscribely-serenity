import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { TelegramBot } from "https://deno.land/x/telegram_bot_api/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const reqBody = await req.json();
    const { userId, verificationCode, customBotToken } = reqBody;
    
    // Check if we have all required fields
    if (!verificationCode) {
      return new Response(
        JSON.stringify({ success: false, message: 'Verification code is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Initialize the Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ success: false, message: 'Server configuration error' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, message: 'Authorization header is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Get JWT token from the auth header
    const token = authHeader.replace('Bearer ', '');
    
    // Verify JWT token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid authentication token' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Get bot token based on user's preference
    let botToken: string;
    
    if (customBotToken) {
      // Use custom bot token if provided
      botToken = customBotToken;
      console.log('Using custom bot token provided in request');
    } else {
      // Get the user's profile to check for custom bot preference
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('use_custom_bot, custom_bot_token')
        .eq('id', user.id)
        .single();
      
      if (!profileError && profileData && profileData.use_custom_bot && profileData.custom_bot_token) {
        // Use custom bot token from profile
        botToken = profileData.custom_bot_token;
        console.log('Using custom bot token from user profile');
      } else {
        // Get the default bot token from the database
        const { data: globalSettings, error: globalSettingsError } = await supabase
          .from('telegram_global_settings')
          .select('bot_token')
          .single();
        
        if (globalSettingsError || !globalSettings?.bot_token) {
          return new Response(
            JSON.stringify({ success: false, message: 'Default bot not configured' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          );
        }
        
        botToken = globalSettings.bot_token;
        console.log('Using default bot token from global settings');
      }
    }

    // Initialize the Telegram Bot API client
    const bot = new TelegramBot(botToken);

    // Get the list of updates (messages) from the bot
    try {
      const updates = await bot.getUpdates({ limit: 100, timeout: 60 });
      
      console.log(`Received ${updates.result.length} updates`);
      
      // Filter for messages that contain our verification code
      const matchingUpdates = updates.result.filter(update => {
        return update.message && 
               update.message.text && 
               update.message.text.includes(verificationCode);
      });
      
      console.log(`Found ${matchingUpdates.length} matching updates with code ${verificationCode}`);
      
      if (matchingUpdates.length === 0) {
        return new Response(
          JSON.stringify({ success: false, message: 'Verification code not found' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get the first matching update
      const update = matchingUpdates[0];
      const chatId = update.message?.chat.id.toString();
      const chatTitle = update.message?.chat.title || 'Unnamed Channel';
      const chatUsername = update.message?.chat.username || null;
      
      if (!chatId) {
        return new Response(
          JSON.stringify({ success: false, message: 'Unable to identify chat' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Check if this chat has already been connected to another user
      const { data: existingCommunity, error: checkError } = await supabase
        .from('communities')
        .select('*')
        .eq('telegram_chat_id', chatId)
        .single();
        
      if (existingCommunity && existingCommunity.owner_id !== user.id) {
        console.log(`Chat ${chatId} is already connected to user ${existingCommunity.owner_id}`);
        return new Response(
          JSON.stringify({ 
            success: false, 
            errorType: 'DUPLICATE_CHAT',
            chatId: chatId,
            message: 'This Telegram group is already connected to another account' 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // If we reach here, either:
      // 1. This is a new chat that hasn't been connected yet
      // 2. This chat is already connected to the current user (reconnecting/updating)
      
      // Get chat photo if available
      let photoUrl = null;
      try {
        const chatObject = await bot.getChat({ chat_id: chatId });
        if (chatObject.result.photo) {
          // Get the file path of the biggest photo
          const fileId = chatObject.result.photo.big_file_id;
          const fileInfo = await bot.getFile({ file_id: fileId });
          
          if (fileInfo.result.file_path) {
            // Construct the direct URL to the file
            photoUrl = `https://api.telegram.org/file/bot${botToken}/${fileInfo.result.file_path}`;
          }
        }
      } catch (photoError) {
        console.error("Failed to get chat photo:", photoError);
        // Continue without photo, it's not critical
      }
      
      // Get user's custom bot preference
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('use_custom_bot, custom_bot_token')
        .eq('id', user.id)
        .single();
        
      const useCustomBot = profileData?.use_custom_bot || false;
      const botTokenForSettings = useCustomBot ? profileData?.custom_bot_token : null;
      
      // Get or create community record
      let community;
      
      if (existingCommunity) {
        // Update existing community
        const { data: updatedCommunity, error: updateError } = await supabase
          .from('communities')
          .update({
            name: chatTitle,
            telegram_username: chatUsername,
            telegram_photo_url: photoUrl || existingCommunity.telegram_photo_url,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingCommunity.id)
          .select()
          .single();
          
        if (updateError) {
          console.error("Failed to update community:", updateError);
          return new Response(
            JSON.stringify({ success: false, message: 'Failed to update community record' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          );
        }
        
        community = updatedCommunity;
      } else {
        // Create new community
        const { data: newCommunity, error: createError } = await supabase
          .from('communities')
          .insert({
            name: chatTitle,
            owner_id: user.id,
            telegram_chat_id: chatId,
            telegram_username: chatUsername,
            telegram_photo_url: photoUrl
          })
          .select()
          .single();
          
        if (createError) {
          console.error("Failed to create community:", createError);
          return new Response(
            JSON.stringify({ success: false, message: 'Failed to create community record' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          );
        }
        
        community = newCommunity;
        
        // Initialize bot settings for this community
        await supabase
          .from('telegram_bot_settings')
          .insert({
            project_id: community.id,
            chat_id: chatId,
            verification_code: verificationCode,
            verified_at: new Date().toISOString(),
            use_custom_bot: useCustomBot,
            custom_bot_token: botTokenForSettings
          });
      }
      
      // Clear the verification code from the user's profile
      await supabase
        .from('profiles')
        .update({ current_telegram_code: null })
        .eq('id', user.id);

      // Return success
      return new Response(
        JSON.stringify({ 
          success: true, 
          community: community
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
      
    } catch (telegramError) {
      console.error("Telegram API error:", telegramError);
      return new Response(
        JSON.stringify({ success: false, message: 'Error connecting to Telegram: ' + telegramError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Error in verify-telegram-code function:', error);
    
    return new Response(
      JSON.stringify({ success: false, message: error.message || 'An unexpected error occurred' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

// Simplified local implementation of createBotSettings to fix the community_id reference issue
async function createBotSettings(
  supabase: ReturnType<typeof createClient>,
  logger: LoggerService,
  params: CreateBotSettingsParams
) {
  const { communityId, chatId, communityName, description, verificationCode } = params;

  try {
    // Check if settings already exist
    const { data: existingSettings } = await supabase
      .from('telegram_bot_settings')
      .select('id')
      .eq('project_id', communityId) // Changed from community_id to project_id
      .single();

    if (existingSettings) {
      await logger.info(`Bot settings already exist for project ${communityId}`);
      return { success: true, data: existingSettings };
    }

    // Create default bot settings
    const { data: settings, error: settingsError } = await supabase
      .from('telegram_bot_settings')
      .insert({
        project_id: communityId, // Changed from community_id to project_id
        chat_id: chatId,
        is_admin: false, // Will be updated after checking bot permissions
        welcome_message: `Welcome to ${communityName}! 🎉\n\n${description ? description + '\n\n' : ''}To join and access exclusive content, please subscribe using the button below:`,
        welcome_image: null, // Will be updated by photo handler
        verification_code: verificationCode || null,
        verified_at: new Date().toISOString(),
        subscription_reminder_days: 3,
        subscription_reminder_message: `Your subscription to ${communityName} will expire soon. Don't miss out - renew now to maintain access! 🔄`,
        first_reminder_days: 7,
        second_reminder_days: 3,
        first_reminder_message: `Your subscription to ${communityName} will expire in 7 days. Renew now to ensure uninterrupted access! ⏳`,
        second_reminder_message: `Final reminder: Your subscription expires in 3 days. Don't forget to renew! ⚠️`,
        first_reminder_image: null,
        second_reminder_image: null,
        expired_subscription_message: `Your subscription to ${communityName} has expired. Renew now to regain access! 🔒`,
        auto_remove_expired: true,
        renewal_discount_enabled: true,
        renewal_discount_percentage: 10,
        auto_welcome_message: true,
        bot_signature: '🤖 Powered by Membify',
        language: 'en',
        max_messages_per_day: 10
      })
      .select()
      .single();

    if (settingsError) {
      await logger.error(`❌ Failed to create bot settings:`, settingsError);
      return { success: false, error: settingsError };
    }

    await logger.success(`✅ Successfully created bot settings for project ${communityId}`);
    return { success: true, data: settings };
  } catch (error) {
    await logger.error(`❌ Error in createBotSettings:`, error);
    return { success: false, error };
  }
}

// Simple logger implementation for this function
class LoggerService {
  constructor(private prefix: string) {}

  async info(message: string, data?: any): Promise<void> {
    console.log(`[${this.prefix}] [INFO] ${message}`, data ? data : '');
  }

  async error(message: string, data?: any): Promise<void> {
    console.error(`[${this.prefix}] [ERROR] ${message}`, data ? data : '');
  }

  async success(message: string, data?: any): Promise<void> {
    console.log(`[${this.prefix}] [SUCCESS] ${message}`, data ? data : '');
  }
}

const corsHeadersWithAuth = {
  ...corsHeaders,
  'Access-Control-Allow-Credentials': 'true',
};
