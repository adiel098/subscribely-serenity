import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.2";
import { Router } from "https://deno.land/x/oak@v11.1.0/router.ts";
import { Application, Context } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { corsHeaders } from "./cors.ts";
import { setupWebhookConfig } from "./config/webhookConfig.ts";
import { sendTelegramMessage, sendTelegramPhotoMessage } from "./telegramClient.ts";

// Create Oak application
const app = new Application();
const router = new Router();

// Handle CORS preflight requests
app.use(async (ctx, next) => {
  if (ctx.request.method === "OPTIONS") {
    ctx.response.headers.set("Access-Control-Allow-Origin", "*");
    ctx.response.headers.set("Access-Control-Allow-Headers", "authorization, x-client-info, apikey, content-type");
    ctx.response.status = 204;
    return;
  }
  await next();
});

// Set CORS headers for all responses
app.use(async (ctx, next) => {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    ctx.response.headers.set(key, value);
  });
  await next();
});

// Direct message endpoint
router.post("/direct-message", async (ctx) => {
  try {
    const requestBody = await ctx.request.body.json();
    const { action, bot_token, chat_id, text, photo, caption, button_text, button_url } = requestBody;
    
    console.log(`[Direct Message] Processing ${action} to chat_id: ${chat_id}`);
    
    if (!bot_token || !chat_id) {
      ctx.response.status = 400;
      ctx.response.body = { success: false, error: "Missing required parameters" };
      return;
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
        ctx.response.status = 400;
        ctx.response.body = { success: false, error: "Missing text for message" };
        return;
      }
      
      result = await sendTelegramMessage(bot_token, chat_id, text, inlineKeyboard);
    } 
    else if (action === "send_photo") {
      if (!photo) {
        ctx.response.status = 400;
        ctx.response.body = { success: false, error: "Missing photo for message" };
        return;
      }
      
      result = await sendTelegramPhotoMessage(bot_token, chat_id, photo, caption || "", inlineKeyboard);
    } 
    else {
      ctx.response.status = 400;
      ctx.response.body = { success: false, error: "Invalid action" };
      return;
    }
    
    console.log(`[Direct Message] Message sent successfully to ${chat_id}`);
    
    ctx.response.status = 200;
    ctx.response.body = { success: true, result };
  } catch (error) {
    console.error("[Direct Message] Error:", error);
    ctx.response.status = 500;
    ctx.response.body = { success: false, error: error.message };
  }
});

// Add routes to the application
app.use(router.routes());
app.use(router.allowedMethods());

// Serve the application
serve(async (req) => {
  // Special case for direct-message POST requests without Oak
  const url = new URL(req.url);
  if (url.pathname === "/direct-message" && req.method === "POST") {
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
  }
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  // For all other requests, use the Oak application
  return await app.handle(req);
});
