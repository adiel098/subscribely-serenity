import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const telegramBotToken = Deno.env.get('TELEGRAM_BOT_TOKEN') || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { broadcast_id, entity_id, entity_type, filter_type, subscription_plan_id, include_button, image } = await req.json();
    
    if (!broadcast_id || !entity_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`🚀 Processing broadcast ${broadcast_id} for ${entity_type} ${entity_id}`);
    console.log('Filter type:', filter_type);
    console.log('Include button:', include_button);
    console.log('Image included:', !!image);

    // Get the broadcast message
    const { data: broadcast, error: broadcastError } = await supabase
      .from('broadcast_messages')
      .select('*')
      .eq('id', broadcast_id)
      .single();
    
    if (broadcastError || !broadcast) {
      console.error('Error fetching broadcast:', broadcastError);
      return new Response(
        JSON.stringify({ error: 'Broadcast not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }
    
    // Simplified approach: directly query community_subscribers table using entity_id
    // This works for both communities and groups since we store them in the same column
    let query = supabase
      .from('community_subscribers')
      .select('telegram_user_id')
      .eq('community_id', entity_id)
      .eq('is_active', true);
    
    // Apply filters as needed
    if (filter_type === 'active') {
      query = query.eq('subscription_status', 'active');
    } else if (filter_type === 'expired') {
      query = query.eq('subscription_status', 'expired');
    } else if (filter_type === 'plan' && subscription_plan_id) {
      query = query.eq('subscription_plan_id', subscription_plan_id);
    }
    
    const { data: recipients, error: recipientsError } = await query;
    
    if (recipientsError) {
      console.error('Error fetching recipients:', recipientsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch recipients', details: recipientsError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    if (!recipients || recipients.length === 0) {
      console.log('No recipients found matching the criteria');
      return new Response(
        JSON.stringify({ 
          success: true, 
          broadcast_id, 
          message: 'No recipients found matching the criteria',
          total_recipients: 0,
          sent_success: 0,
          sent_failed: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Deduplicate recipients (just in case)
    const uniqueRecipients = [...new Map(recipients.map(item => 
      [item.telegram_user_id, item]
    )).values()];
    
    console.log(`📨 Sending broadcast to ${uniqueRecipients.length} recipients`);
    
    // Update broadcast with total recipients
    await supabase
      .from('broadcast_messages')
      .update({
        status: 'sending',
        total_recipients: uniqueRecipients.length,
        updated_at: new Date().toISOString()
      })
      .eq('id', broadcast_id);
    
    // Fetch entity details for button linking
    const { data: entityDetails } = await supabase
      .from('communities')
      .select('custom_link, id')
      .eq('id', entity_id)
      .single();
    
    const miniAppUrl = entityDetails?.custom_link || 
      `https://t.me/SubscribelyBot/webapp?startapp=${entity_id}`;
    
    // Prepare the join button if requested
    const inlineKeyboard = include_button ? {
      inline_keyboard: [[
        {
          text: "Join Community🚀",
          web_app: { url: miniAppUrl }
        }
      ]]
    } : undefined;
    
    let sentSuccess = 0;
    let sentFailed = 0;
    
    // Send messages
    for (const recipient of uniqueRecipients) {
      try {
        let response;
        
        // If we have an image, send as photo with caption
        if (image) {
          response = await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendPhoto`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              chat_id: recipient.telegram_user_id,
              photo: image,
              caption: broadcast.message,
              parse_mode: 'HTML',
              reply_markup: inlineKeyboard ? JSON.stringify(inlineKeyboard) : undefined
            })
          });
        } else {
          // Otherwise send as text message
          response = await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              chat_id: recipient.telegram_user_id,
              text: broadcast.message,
              parse_mode: 'HTML',
              reply_markup: inlineKeyboard ? JSON.stringify(inlineKeyboard) : undefined
            })
          });
        }
        
        const result = await response.json();
        
        if (result.ok) {
          sentSuccess++;
          console.log(`✅ Successfully sent message to ${recipient.telegram_user_id}`);
        } else {
          console.error(`Error sending to ${recipient.telegram_user_id}:`, result.description);
          
          // If image sending fails, attempt fallback to text-only message
          if (image && result.description) {
            try {
              console.log(`🔄 Attempting fallback to text-only message for ${recipient.telegram_user_id}`);
              const fallbackResponse = await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  chat_id: recipient.telegram_user_id,
                  text: broadcast.message,
                  parse_mode: 'HTML',
                  reply_markup: inlineKeyboard ? JSON.stringify(inlineKeyboard) : undefined
                })
              });
              
              const fallbackResult = await fallbackResponse.json();
              
              if (fallbackResult.ok) {
                sentSuccess++;
                console.log(`✅ Successfully sent fallback text message to ${recipient.telegram_user_id}`);
                continue; // Skip counting as failed
              }
            } catch (fallbackError) {
              console.error(`Failed even with fallback for ${recipient.telegram_user_id}:`, fallbackError);
            }
          }
          
          sentFailed++;
        }
      } catch (error) {
        console.error(`Error sending to ${recipient.telegram_user_id}:`, error);
        sentFailed++;
      }
      
      // Update broadcast stats every 10 messages
      if ((sentSuccess + sentFailed) % 10 === 0) {
        await supabase
          .from('broadcast_messages')
          .update({
            sent_success: sentSuccess,
            sent_failed: sentFailed,
            updated_at: new Date().toISOString()
          })
          .eq('id', broadcast_id);
      }
    }
    
    // Update final broadcast status
    await supabase
      .from('broadcast_messages')
      .update({
        status: 'completed',
        sent_success: sentSuccess,
        sent_failed: sentFailed,
        sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', broadcast_id);
    
    console.log(`✅ Broadcast complete: ${sentSuccess} sent, ${sentFailed} failed`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        broadcast_id, 
        total_recipients: uniqueRecipients.length,
        sent_success: sentSuccess,
        sent_failed: sentFailed
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing broadcast:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An error occurred while processing the broadcast' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
