
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

interface BotResponse {
  ok: boolean;
  result?: {
    id: number;
    is_bot: boolean;
    first_name: string;
    username?: string;
    can_join_groups?: boolean;
    can_read_all_group_messages?: boolean;
  };
  description?: string;
  error_code?: number;
}

interface ValidateResponse {
  valid: boolean;
  message?: string;
  botInfo?: any;
  chatList?: any[];
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the request body
    const { botToken, communityId, projectId } = await req.json();
    
    if (!botToken) {
      return new Response(
        JSON.stringify({ valid: false, message: 'Bot token is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Validating bot token (truncated): ${botToken.substring(0, 10)}...`);
    
    // First validate the bot token by getting the bot's info
    const botInfoUrl = `https://api.telegram.org/bot${botToken}/getMe`;
    const botInfoResponse = await fetch(botInfoUrl);
    
    if (!botInfoResponse.ok) {
      const errorData = await botInfoResponse.json();
      console.error("Bot validation error:", errorData);
      return new Response(
        JSON.stringify({
          valid: false,
          message: errorData.description || 'Invalid bot token'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const botData: BotResponse = await botInfoResponse.json();
    
    if (!botData.ok || !botData.result) {
      return new Response(
        JSON.stringify({
          valid: false,
          message: botData.description || 'Failed to validate bot'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Bot ${botData.result.username || botData.result.first_name} validated successfully`);
    
    // Get list of groups/channels where the bot is an admin
    const updateUrl = `https://api.telegram.org/bot${botToken}/getUpdates?allowed_updates=[]`;
    const updateResponse = await fetch(updateUrl);
    const updateData = await updateResponse.json();

    // Get chats where bot is admin using getChatAdministrators
    const chatList: any[] = [];
    const processedChatIds = new Set();
    
    if (updateData.ok && updateData.result) {
      // Process updates to find groups/channels
      for (const update of updateData.result) {
        let chatId = null;
        let chat = null;
        
        // Extract chat from different types of updates
        if (update.message && update.message.chat) {
          chat = update.message.chat;
          chatId = chat.id;
        } else if (update.channel_post && update.channel_post.chat) {
          chat = update.channel_post.chat;
          chatId = chat.id;
        } else if (update.my_chat_member && update.my_chat_member.chat) {
          chat = update.my_chat_member.chat;
          chatId = chat.id;
        }
        
        // Skip duplicate chats and private chats
        if (!chatId || processedChatIds.has(chatId) || (chat.type === 'private')) {
          continue;
        }
        
        processedChatIds.add(chatId);
        
        // Check if bot is admin in this chat
        try {
          const adminsUrl = `https://api.telegram.org/bot${botToken}/getChatAdministrators?chat_id=${chatId}`;
          const adminsResponse = await fetch(adminsUrl);
          const adminsData = await adminsResponse.json();
          
          if (adminsData.ok && adminsData.result) {
            // Check if bot is among admins
            const botIsAdmin = adminsData.result.some(
              (admin: any) => admin.user && admin.user.id === botData.result!.id
            );
            
            if (botIsAdmin) {
              // Get more chat info
              const chatInfoUrl = `https://api.telegram.org/bot${botToken}/getChat?chat_id=${chatId}`;
              const chatInfoResponse = await fetch(chatInfoUrl);
              const chatInfoData = await chatInfoResponse.json();
              
              if (chatInfoData.ok && chatInfoData.result) {
                const chatInfo = chatInfoData.result;
                let photoUrl = null;
                
                // Get chat photo if available
                if (chatInfo.photo) {
                  try {
                    const fileId = chatInfo.photo.big_file_id || chatInfo.photo.small_file_id;
                    if (fileId) {
                      const fileInfoUrl = `https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`;
                      const fileInfoResponse = await fetch(fileInfoUrl);
                      const fileInfoData = await fileInfoResponse.json();
                      
                      if (fileInfoData.ok && fileInfoData.result && fileInfoData.result.file_path) {
                        photoUrl = `https://api.telegram.org/file/bot${botToken}/${fileInfoData.result.file_path}`;
                      }
                    }
                  } catch (photoError) {
                    console.error(`Failed to get photo for chat ${chatId}:`, photoError);
                  }
                }
                
                // Get member count
                let memberCount = null;
                try {
                  const memberCountUrl = `https://api.telegram.org/bot${botToken}/getChatMemberCount?chat_id=${chatId}`;
                  const memberCountResponse = await fetch(memberCountUrl);
                  const memberCountData = await memberCountResponse.json();
                  
                  if (memberCountData.ok) {
                    memberCount = memberCountData.result;
                  }
                } catch (countError) {
                  console.error(`Failed to get member count for chat ${chatId}:`, countError);
                }
                
                // Add chat to list
                chatList.push({
                  id: chatId.toString(),
                  title: chatInfo.title || `Chat ${chatId}`,
                  type: chatInfo.type,
                  username: chatInfo.username || null,
                  description: chatInfo.description || null,
                  member_count: memberCount,
                  photo_url: photoUrl,
                  invite_link: chatInfo.invite_link || null
                });
              }
            }
          }
        } catch (adminError) {
          console.error(`Failed to check admin status for chat ${chatId}:`, adminError);
        }
      }
    }
    
    console.log(`Found ${chatList.length} chats where bot is admin`);
    
    // If a communityId is provided, update the community with bot info
    if (communityId || projectId) {
      try {
        // Get Supabase credentials from environment
        const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
        const supabase = createClient(supabaseUrl, supabaseKey);

        if (communityId) {
          // Update community bot status
          await supabase
            .from('communities')
            .update({
              bot_status: 'active',
              bot_added_at: new Date().toISOString()
            })
            .eq('id', communityId);
            
          console.log(`Updated community ${communityId} bot status to active`);
        }
        
        if (projectId) {
          // Update project bot token
          await supabase
            .from('projects')
            .update({
              bot_token: botToken
            })
            .eq('id', projectId);
            
          console.log(`Updated bot token for project ${projectId}`);
        }
      } catch (dbError) {
        console.error("Failed to update database:", dbError);
      }
    }
    
    // Return success response with bot info and chat list
    return new Response(
      JSON.stringify({
        valid: true,
        botInfo: {
          id: botData.result.id,
          username: botData.result.username,
          name: botData.result.first_name,
          canJoinGroups: botData.result.can_join_groups,
          canReadAllGroupMessages: botData.result.can_read_all_group_messages
        },
        chatList
      } as ValidateResponse),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    
    return new Response(
      JSON.stringify({
        valid: false,
        message: `Error: ${error.message || "Unknown error occurred"}`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
