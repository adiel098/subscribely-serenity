
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

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
    const { botToken } = await req.json();
    
    // Check if we have required fields
    if (!botToken) {
      return new Response(
        JSON.stringify({ valid: false, message: 'Bot token is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

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

    // Get bot chat information
    const chatResponse = await fetch(`https://api.telegram.org/bot${botToken}/getUpdates`);
    const chatData = await chatResponse.json();
    
    console.log("Chat updates data:", chatData);
    
    // Get bot's chat list (groups/channels where the bot is added)
    const chatList = [];
    const processedChatIds = new Set();
    
    if (chatData.ok && chatData.result) {
      // Process chats from updates
      for (const update of chatData.result) {
        // Check for regular messages (groups and supergroups)
        if (update.message && update.message.chat) {
          const chat = update.message.chat;
          if ((chat.type === 'group' || chat.type === 'supergroup' || chat.type === 'channel') 
              && !processedChatIds.has(chat.id)) {
                
            processedChatIds.add(chat.id);
            const chatInfo = {
              id: chat.id,
              title: chat.title,
              type: chat.type,
              username: chat.username || null
            };
            
            chatList.push(chatInfo);
          }
        }
        
        // Check for channel posts
        if (update.channel_post && update.channel_post.chat) {
          const chat = update.channel_post.chat;
          if (!processedChatIds.has(chat.id)) {
            processedChatIds.add(chat.id);
            const chatInfo = {
              id: chat.id,
              title: chat.title,
              type: chat.type,
              username: chat.username || null
            };
            
            chatList.push(chatInfo);
          }
        }
      }
      
      // Try to get chat photos for each chat
      for (const chat of chatList) {
        try {
          const photoResponse = await fetch(
            `https://api.telegram.org/bot${botToken}/getChat?chat_id=${chat.id}`
          );
          const chatInfo = await photoResponse.json();
          
          if (photoResponse.ok && chatInfo.ok && chatInfo.result) {
            // Update with any additional info
            if (chatInfo.result.username && !chat.username) {
              chat.username = chatInfo.result.username;
            }
            
            // Get chat photo if available
            if (chatInfo.result.photo) {
              const fileResponse = await fetch(
                `https://api.telegram.org/bot${botToken}/getFile?file_id=${chatInfo.result.photo.big_file_id}`
              );
              const fileData = await fileResponse.json();
              
              if (fileResponse.ok && fileData.ok && fileData.result && fileData.result.file_path) {
                chat.photo_url = `https://api.telegram.org/file/bot${botToken}/${fileData.result.file_path}`;
              }
            }
          }
        } catch (error) {
          console.error(`Error fetching additional info for chat ${chat.id}:`, error);
          // Continue without additional info
        }
      }
    }
    
    // Return success response with bot and chat info
    return new Response(
      JSON.stringify({ 
        valid: true, 
        botUsername: botUsername,
        chatList: chatList,
        message: 'Bot validated successfully'
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
