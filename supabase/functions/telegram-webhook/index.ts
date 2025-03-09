import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.2";
import { Router } from "https://deno.land/x/oak@v11.1.0/router.ts";
import { Application, Context } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { corsHeaders } from "./cors.ts";
import { setupWebhookConfig } from "./config/webhookConfig.ts";
import { sendTelegramMessage, sendTelegramPhotoMessage } from "./telegramClient.ts";

const router = new Router();

router.post("/direct-message", async (req) => {
  try {
    const { action, bot_token, chat_id, text, photo, caption, button_text, button_url } = await req.json();
    
    console.log(`[Direct Message] Processing ${action} to chat_id: ${chat_id}`);
    
    if (!bot_token || !chat_id) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required parameters" }),
        { status: 400, headers: corsHeaders }
      );
    }
    
    // Create inline keyboard if button is provided
    let inlineKeyboard = null;
    if (button_text && button_url) {
      inlineKeyboard = {
        inline_keyboard: [
          [
            {
              text: button_text,
              url: button_url
            }
          ]
        ]
      };
    }
    
    let result;
    
    // Handle different message types
    if (action === "send_message") {
      if (!text) {
        return new Response(
          JSON.stringify({ success: false, error: "Missing text for message" }),
          { status: 400, headers: corsHeaders }
        );
      }
      
      result = await sendTelegramMessage(bot_token, chat_id, text, inlineKeyboard);
    } 
    else if (action === "send_photo") {
      if (!photo) {
        return new Response(
          JSON.stringify({ success: false, error: "Missing photo for message" }),
          { status: 400, headers: corsHeaders }
        );
      }
      
      result = await sendTelegramPhotoMessage(bot_token, chat_id, photo, caption || "", inlineKeyboard);
    } 
    else {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid action" }),
        { status: 400, headers: corsHeaders }
      );
    }
    
    console.log(`[Direct Message] Message sent successfully to ${chat_id}`);
    
    return new Response(
      JSON.stringify({ success: true, result }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("[Direct Message] Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: corsHeaders }
    );
  }
});

// ... keep existing code
