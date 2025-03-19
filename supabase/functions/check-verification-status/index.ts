
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const corsHeadersWithAuth = {
  ...corsHeaders,
  'Access-Control-Allow-Credentials': 'true',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeadersWithAuth, status: 204 });
  }
  
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get verification data from request
    const { userId, verificationCode } = await req.json();
    
    console.log(`Processing verification check for user ${userId} with code ${verificationCode}`);
    
    if (!userId || !verificationCode) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required parameters' }),
        { headers: { ...corsHeadersWithAuth, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Manual verification request - forces a recheck
    try {
      // 1. Check if the verification code exists in the profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .eq('current_telegram_code', verificationCode)
        .maybeSingle();
        
      if (profileError) {
        console.error('Error checking profile:', profileError);
      }
      
      if (profile) {
        console.log('Found matching profile');
        
        // Check for recent message with this code by querying the logs
        const { data: logEntry, error: logError } = await supabase
          .from('system_logs')
          .select('*')
          .eq('event_type', 'TELEGRAM_WEBHOOK_VERIFICATION_INFO')
          .ilike('details', `%${verificationCode}%`)
          .order('created_at', { ascending: false })
          .limit(1);
          
        if (logError) {
          console.error('Error checking logs:', logError);
        }
        
        if (logEntry && logEntry.length > 0) {
          console.log('Found recent log entry for this verification code:', logEntry[0]);
        }
        
        // Now trigger a function that would manually check the telegram global settings for this user
        const { data: botToken } = await supabase
          .from('telegram_global_settings')
          .select('bot_token')
          .single();
          
        if (botToken?.bot_token) {
          // Get the chat_id from the logs if available
          let chatId = null;
          try {
            if (logEntry && logEntry.length > 0 && logEntry[0].metadata?.chat_id) {
              chatId = logEntry[0].metadata.chat_id;
            }
          } catch (e) {
            console.error('Error extracting chat_id from logs:', e);
          }
          
          if (chatId) {
            console.log(`Attempting to process verification for chat_id: ${chatId}`);
            
            // Check if this chat_id already exists in any community
            const { data: existingCommunityByChat, error: existingChatError } = await supabase
              .from('communities')
              .select('id, owner_id')
              .eq('telegram_chat_id', chatId)
              .maybeSingle();
            
            if (existingChatError) {
              console.error('Error checking existing community by chat ID:', existingChatError);
            }
            
            // If this chat is already connected to a different user's community
            if (existingCommunityByChat && existingCommunityByChat.owner_id !== userId) {
              console.log(`Chat ID ${chatId} already exists for a different owner!`);
              await supabase
                .from('system_logs')
                .insert({
                  event_type: 'MANUAL_VERIFICATION_DUPLICATE',
                  details: `Duplicate chat ID ${chatId} detected for user ${userId}`,
                  metadata: { 
                    userId, 
                    chatId, 
                    verificationCode,
                    existingOwnerId: existingCommunityByChat.owner_id 
                  }
                });
              
              return new Response(
                JSON.stringify({ 
                  success: true, 
                  verified: false,
                  duplicate: true,
                  communities: []
                }),
                { headers: { ...corsHeadersWithAuth, 'Content-Type': 'application/json' } }
              );
            }
            
            // Try to create/update community with this chat_id
            const { data: existingCommunity, error: existingError } = await supabase
              .from('communities')
              .select('*')
              .eq('owner_id', userId)
              .eq('telegram_chat_id', chatId)
              .maybeSingle();
              
            if (existingError) {
              console.error('Error checking existing community:', existingError);
            }
            
            if (!existingCommunity) {
              // Create new community
              const { data: newCommunity, error: createError } = await supabase
                .from('communities')
                .insert({
                  name: 'Telegram Community',
                  owner_id: userId,
                  platform: 'telegram',
                  telegram_chat_id: chatId,
                  platform_id: chatId
                })
                .select()
                .single();
                
              if (createError) {
                console.error('Error creating community:', createError);
              } else {
                console.log('Successfully created community:', newCommunity);
                
                // Also add to telegram_bot_settings
                const { error: settingsError } = await supabase
                  .from('telegram_bot_settings')
                  .insert({
                    community_id: newCommunity.id,
                    chat_id: chatId,
                    verification_code: verificationCode,
                    verified_at: new Date().toISOString()
                  });
                  
                if (settingsError) {
                  console.error('Error creating bot settings:', settingsError);
                }
                
                // Add log entry for successful verification
                await supabase
                  .from('system_logs')
                  .insert({
                    event_type: 'MANUAL_VERIFICATION_SUCCESS',
                    details: `Successfully verified community for user ${userId}`,
                    metadata: { userId, chatId, verificationCode, communityId: newCommunity.id }
                  });
              }
            } else {
              console.log('Community already exists:', existingCommunity);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error in manual verification process:', error);
    }
    
    // Check if there are any communities for this user with telegram_chat_id
    const { data: communities, error: communityError } = await supabase
      .from('communities')
      .select('*')
      .eq('owner_id', userId)
      .not('telegram_chat_id', 'is', null)
      .order('created_at', { ascending: false });
      
    if (communityError) {
      console.error('Error checking communities:', communityError);
      return new Response(
        JSON.stringify({ success: false, error: communityError.message }),
        { headers: { ...corsHeadersWithAuth, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        verified: communities && communities.length > 0,
        communities: communities || []
      }),
      { headers: { ...corsHeadersWithAuth, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in check-verification-status:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeadersWithAuth, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
