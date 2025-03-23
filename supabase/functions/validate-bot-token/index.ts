
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    // Get request body
    const { botToken, communityId } = await req.json();
    
    // Check if we have all required fields
    if (!botToken) {
      return new Response(
        JSON.stringify({ valid: false, message: 'Bot token is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    if (!communityId) {
      return new Response(
        JSON.stringify({ valid: false, message: 'Community ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Initialize the Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ valid: false, message: 'Server configuration error' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validate the bot token by calling Telegram API
    const botResponse = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
    const botData = await botResponse.json();

    if (!botResponse.ok || !botData.ok) {
      console.error('Invalid bot token:', botData);
      return new Response(
        JSON.stringify({ 
          valid: false, 
          message: botData.description || 'Invalid bot token' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const botUsername = botData.result.username;
    console.log(`Bot validated: ${botUsername}`);

    // Set up the webhook for the bot to receive messages
    const webhookUrl = `${supabaseUrl}/functions/v1/telegram-webhook`;
    const webhookResponse = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ["message", "callback_query", "chat_member", "my_chat_member"],
      }),
    });
    
    const webhookData = await webhookResponse.json();
    
    if (!webhookResponse.ok || !webhookData.ok) {
      console.error('Failed to set webhook:', webhookData);
      return new Response(
        JSON.stringify({ 
          valid: false, 
          message: `Bot is valid, but webhook setup failed: ${webhookData.description || 'Unknown error'}` 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Webhook set up successfully for bot ${botUsername}`);

    // Save the bot token securely in the database
    // Note: In a production environment, you should encrypt this token
    const { error: updateError } = await supabase
      .from('telegram_bot_settings')
      .update({
        use_custom_bot: true,
        custom_bot_token: botToken
      })
      .eq('community_id', communityId);

    if (updateError) {
      console.error('Error saving bot token:', updateError);
      return new Response(
        JSON.stringify({ 
          valid: false, 
          message: 'Bot is valid, but error saving settings' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log(`Bot settings updated for community ${communityId}`);

    // Send a test message to ensure the bot works
    // This step would require knowing a chat ID to send to,
    // which we don't have at this point, so we'll skip it

    // Return success response
    return new Response(
      JSON.stringify({ 
        valid: true, 
        botUsername: botUsername, 
        message: 'Bot validated and webhook set up successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in validate-bot-token function:', error);
    
    return new Response(
      JSON.stringify({ valid: false, message: error.message || 'An unexpected error occurred' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
