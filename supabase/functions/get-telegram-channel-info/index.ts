
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

interface ChannelInfoResponse {
  success: boolean;
  photoUrl?: string;
  memberCount?: number;
  description?: string;
  error?: string;
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
    const { botToken, chatId } = await req.json();
    
    if (!botToken) {
      return new Response(
        JSON.stringify({ success: false, error: 'Bot token is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!chatId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Chat ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Getting info for chat: ${chatId}`);
    
    // First, fetch the chat info
    const chatInfoUrl = `https://api.telegram.org/bot${botToken}/getChat?chat_id=${chatId}`;
    const chatInfoResponse = await fetch(chatInfoUrl);
    
    if (!chatInfoResponse.ok) {
      const errorData = await chatInfoResponse.json();
      console.error("Chat info error:", errorData);
      return new Response(
        JSON.stringify({
          success: false,
          error: errorData.description || 'Failed to get chat information'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const chatInfoData = await chatInfoResponse.json();
    
    if (!chatInfoData.ok || !chatInfoData.result) {
      return new Response(
        JSON.stringify({
          success: false,
          error: chatInfoData.description || 'Failed to get chat information'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const chatInfo = chatInfoData.result;
    const response: ChannelInfoResponse = {
      success: true,
      description: chatInfo.description || null,
    };

    // Get photo URL if available
    if (chatInfo.photo) {
      try {
        const fileId = chatInfo.photo.big_file_id || chatInfo.photo.small_file_id;
        if (fileId) {
          const fileInfoUrl = `https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`;
          const fileInfoResponse = await fetch(fileInfoUrl);
          const fileInfoData = await fileInfoResponse.json();
          
          if (fileInfoData.ok && fileInfoData.result && fileInfoData.result.file_path) {
            response.photoUrl = `https://api.telegram.org/file/bot${botToken}/${fileInfoData.result.file_path}`;
          }
        }
      } catch (photoError) {
        console.error(`Failed to get photo for chat ${chatId}:`, photoError);
      }
    }
    
    // Get member count
    try {
      const memberCountUrl = `https://api.telegram.org/bot${botToken}/getChatMemberCount?chat_id=${chatId}`;
      const memberCountResponse = await fetch(memberCountUrl);
      const memberCountData = await memberCountResponse.json();
      
      if (memberCountData.ok) {
        response.memberCount = memberCountData.result;
      }
    } catch (countError) {
      console.error(`Failed to get member count for chat ${chatId}:`, countError);
    }
    
    console.log(`Successfully retrieved info for chat ${chatId}`);
    
    // Return success response
    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error("Error processing request:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: `Error: ${error.message || "Unknown error occurred"}`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
