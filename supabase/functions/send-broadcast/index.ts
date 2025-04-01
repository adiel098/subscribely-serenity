import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.2";

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle CORS preflight requests
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request
    const requestData = await req.json();
    console.log("Received broadcast request:", JSON.stringify(requestData, null, 2));

    // Validate request
    if (!requestData.entityId) {
      throw new Error("Missing entityId");
    }
    if (!requestData.message && !requestData.image) {
      throw new Error("Either message or image must be provided");
    }

    // Extract parameters
    const {
      entityId,
      entityType = "community", // Default to community
      message,
      filterType = "all", // Default to all members
      includeButton = false,
      buttonText = "View Details",
      buttonUrl = "",
      image = null
    } = requestData;

    // Get environment variables
    const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
    if (!botToken) {
      throw new Error("TELEGRAM_BOT_TOKEN is not configured");
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Processing broadcast for ${entityType} ID: ${entityId}`);

    // Get members to broadcast to
    let chatId;
    let members = [];

    if (entityType === "community" || entityType === "group") {
      // Fetch the entity (community or group)
      const { data: entity, error: entityError } = await supabase
        .from(entityType === "community" ? "communities" : "community_groups")
        .select("telegram_chat_id, name")
        .eq("id", entityId)
        .single();

      if (entityError || !entity) {
        console.error(`Error fetching ${entityType}:`, entityError);
        throw new Error(`${entityType} not found`);
      }

      chatId = entity.telegram_chat_id;
      console.log(`Found ${entityType} chat ID: ${chatId}, name: ${entity.name}`);

      // Get members based on filter
      if (filterType === "all" || filterType === "active") {
        const query = supabase
          .from("community_subscribers")
          .select("telegram_user_id")
          .eq("community_id", entityId);

        if (filterType === "active") {
          query.eq("subscription_status", "active");
        }

        const { data: memberData, error: memberError } = await query;

        if (memberError) {
          console.error("Error fetching members:", memberError);
          throw new Error("Failed to fetch members");
        }

        members = memberData.map(m => m.telegram_user_id);
        console.log(`Found ${members.length} members to broadcast to`);
      }
    } else {
      throw new Error(`Unsupported entity type: ${entityType}`);
    }

    if (members.length === 0) {
      console.log("No members to broadcast to");
      return new Response(
        JSON.stringify({ success: false, message: "No members found for broadcast" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send message to each member
    const successCount = await broadcastToMembers(botToken, members, message, image, includeButton, buttonText, buttonUrl);

    // Log the broadcast
    await supabase
      .from("broadcast_logs")
      .insert({
        community_id: entityId,
        message: message,
        filter_type: filterType,
        sent_count: successCount,
        total_count: members.length,
        include_button: includeButton,
        button_text: buttonText,
        button_url: buttonUrl,
        has_image: !!image
      });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Broadcast sent to ${successCount} of ${members.length} members`,
        sent_count: successCount,
        total_count: members.length
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in broadcast function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400
      }
    );
  }
});

async function broadcastToMembers(
  botToken: string,
  members: string[],
  message: string,
  image: string | null = null,
  includeButton: boolean = false,
  buttonText: string = "",
  buttonUrl: string = ""
): Promise<number> {
  let successCount = 0;
  
  for (const memberId of members) {
    try {
      let replyMarkup = null;
      
      // Add reply markup if button is included
      if (includeButton && buttonText && buttonUrl) {
        replyMarkup = {
          inline_keyboard: [
            [{ text: buttonText, url: buttonUrl }]
          ]
        };
      }
      
      // Send message with or without image
      let success = false;
      
      if (image) {
        // Process the image for Telegram compatibility if it's a base64 string
        let processedImage = image;
        if (image.startsWith('data:image')) {
          processedImage = await preprocessBase64Image(image);
        }
        
        success = await sendTelegramPhotoMessage(botToken, memberId, processedImage, message, replyMarkup);
      } else {
        success = await sendTelegramMessage(botToken, memberId, message, replyMarkup);
      }
      
      if (success) {
        successCount++;
      }
      
      // Add a small delay to avoid hitting Telegram's rate limits
      await new Promise(resolve => setTimeout(resolve, 50));
    } catch (error) {
      console.error(`Failed to send message to user ${memberId}:`, error);
      continue;
    }
  }
  
  return successCount;
}

async function preprocessBase64Image(base64Image: string): Promise<string> {
  // Extract the content type and actual base64 data
  const matches = base64Image.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
  
  if (!matches || matches.length !== 3) {
    console.error('Invalid base64 data format');
    return base64Image;
  }
  
  const contentType = matches[1];
  let imageData = matches[2];
  
  // Ensure proper base64 padding
  const paddingNeeded = (4 - (imageData.length % 4)) % 4;
  if (paddingNeeded > 0) {
    imageData += '='.repeat(paddingNeeded);
  }
  
  return `${matches[1]};base64,${imageData}`;
}

async function sendTelegramMessage(
  botToken: string,
  chatId: string | number,
  text: string,
  options: any = {}
) {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML',
      ...options
    }),
  });

  const data = await response.json();
  
  if (!data.ok) {
    throw new Error(`Telegram API error: ${JSON.stringify(data)}`);
  }
  
  return data.ok;
}

async function sendTelegramPhotoMessage(
  botToken: string,
  chatId: string | number,
  photoUrl: string,
  caption: string = '',
  options: any = {}
) {
  try {
    // Handle base64 data URLs
    if (photoUrl.startsWith('data:image')) {
      console.log('Base64 image detected, handling with FormData');
      
      // Extract the content type and data
      const matches = photoUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
      
      if (!matches || matches.length !== 3) {
        console.error('Invalid base64 data format');
        return await sendTelegramMessage(botToken, chatId, caption || "Image could not be sent", options);
      }
      
      const contentType = matches[1];
      let imageData = matches[2];
      
      // Create FormData for multipart request
      const formData = new FormData();
      formData.append('chat_id', chatId.toString());
      
      if (caption) {
        formData.append('caption', caption);
        formData.append('parse_mode', 'HTML');
      }
      
      if (options.reply_markup) {
        formData.append('reply_markup', 
          typeof options.reply_markup === 'string' 
            ? options.reply_markup 
            : JSON.stringify(options.reply_markup));
      }
      
      // Convert base64 to binary
      const binaryStr = atob(imageData);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      
      // Extract file extension
      const extension = contentType.split('/')[1] || 'jpg';
      
      // Create blob and append it
      const blob = new Blob([bytes], { type: contentType });
      formData.append('photo', blob, `photo.${extension}`);
      
      // Send the multipart request
      const response = await fetch(
        `https://api.telegram.org/bot${botToken}/sendPhoto`,
        {
          method: 'POST',
          body: formData
        }
      );
      
      const data = await response.json();
      
      if (!data.ok) {
        console.error("Error sending photo with FormData:", data);
        
        // Fall back to text message
        return await sendTelegramMessage(botToken, chatId, caption || "Image could not be sent", options);
      }
      
      return true;
    } else {
      // For standard URLs
      const url = `https://api.telegram.org/bot${botToken}/sendPhoto`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          photo: photoUrl,
          caption: caption,
          parse_mode: 'HTML',
          ...options
        }),
      });

      const data = await response.json();
      
      if (!data.ok) {
        console.error(`Telegram API error when sending photo:`, data);
        // Fall back to text message
        return await sendTelegramMessage(botToken, chatId, caption || "Image could not be sent", options);
      }
      
      return true;
    }
  } catch (error) {
    console.error("Error sending photo message:", error);
    
    // Fall back to text message on error
    try {
      return await sendTelegramMessage(botToken, chatId, caption || "Image could not be sent", options);
    } catch (finalError) {
      console.error("Even fallback text message failed:", finalError);
      return false;
    }
  }
}
