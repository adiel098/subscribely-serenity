
// Add this new route to handle direct messages (don't remove existing routes)
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

// Make sure to import these from telegramClient.ts at the top of the file
// import { sendTelegramMessage, sendTelegramPhotoMessage } from "./telegramClient.ts";
