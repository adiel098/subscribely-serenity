
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
    const { code, useCustomBot, customBotToken } = await req.json();
    
    // Check if we have all required fields
    if (!code) {
      return new Response(
        JSON.stringify({ error: 'Verification code is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Initialize the Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Get JWT token from the auth header
    const token = authHeader.replace('Bearer ', '');
    
    // Verify JWT token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Get bot token based on user's preference
    let botToken: string;
    
    if (useCustomBot && customBotToken) {
      // Use custom bot token if provided
      botToken = customBotToken;
    } else {
      // Get the default bot token from the database
      const { data: globalSettings, error: globalSettingsError } = await supabase
        .from('telegram_global_settings')
        .select('bot_token')
        .single();
      
      if (globalSettingsError || !globalSettings?.bot_token) {
        return new Response(
          JSON.stringify({ error: 'Default bot not configured' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
      
      botToken = globalSettings.bot_token;
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
               update.message.text.includes(code);
      });
      
      console.log(`Found ${matchingUpdates.length} matching updates with code ${code}`);
      
      if (matchingUpdates.length === 0) {
        return new Response(
          JSON.stringify({ verified: false, message: 'Verification code not found' }),
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
          JSON.stringify({ verified: false, message: 'Unable to identify chat' }),
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
            verified: false, 
            duplicateChatId: chatId,
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
            JSON.stringify({ error: 'Failed to update community record' }),
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
            JSON.stringify({ error: 'Failed to create community record' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          );
        }
        
        community = newCommunity;
        
        // Initialize bot settings for this community
        await supabase
          .from('telegram_bot_settings')
          .insert({
            community_id: community.id,
            chat_id: chatId,
            verification_code: code,
            verified_at: new Date().toISOString(),
            use_custom_bot: useCustomBot,
            custom_bot_token: useCustomBot ? customBotToken : null
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
          verified: true, 
          community: community
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
      
    } catch (telegramError) {
      console.error("Telegram API error:", telegramError);
      return new Response(
        JSON.stringify({ error: 'Error connecting to Telegram: ' + telegramError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Error in verify-telegram-code function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
