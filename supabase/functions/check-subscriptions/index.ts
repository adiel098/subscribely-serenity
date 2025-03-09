
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SubscriptionMember {
  id: string;
  community_id: string;
  telegram_user_id: string;
  subscription_end_date: string | null;
  is_active: boolean;
  subscription_status: string; // Using string type for subscription_status
}

interface BotSettings {
  community_id: string;
  auto_remove_expired: boolean;
  expired_subscription_message: string;
  subscription_reminder_days: number;
  subscription_reminder_message: string;
  first_reminder_days: number;
  first_reminder_message: string;
  first_reminder_image: string | null;
  second_reminder_days: number;
  second_reminder_message: string;
  second_reminder_image: string | null;
  bot_signature: string;
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("OK", { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Starting subscription check process...");

    // Use RPC to call the PostgreSQL function
    const { data: membersToCheck, error: memberError } = await supabase.rpc(
      "get_members_to_check_v2" // Using the new function version with proper string comparisons
    );

    if (memberError) {
      console.error("Error getting members to check:", memberError);
      throw memberError;
    }

    console.log(`Found ${membersToCheck?.length || 0} members to process`);

    // Process each member
    const logs = [];
    for (const member of membersToCheck || []) {
      try {
        // Get bot settings for this community
        const { data: botSettings, error: settingsError } = await supabase
          .from("telegram_bot_settings")
          .select("*")
          .eq("community_id", member.community_id)
          .single();

        if (settingsError) {
          console.error("Error getting bot settings:", settingsError);
          continue;
        }

        // Process this member
        const result = await processMember(supabase, member, botSettings);
        logs.push(result);
        
      } catch (memberProcessError) {
        console.error(
          `Error processing member ${member.telegram_user_id}:`,
          memberProcessError
        );
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${membersToCheck?.length || 0} members`,
        logs,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in check-subscriptions function:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

async function processMember(supabase: any, member: SubscriptionMember, botSettings: BotSettings) {
  // Initialize result object
  const result = {
    memberId: member.id,
    telegramUserId: member.telegram_user_id,
    action: "none",
    details: "",
  };

  // If not active, do nothing
  if (!member.is_active) {
    result.action = "skip";
    result.details = "Member is not active";
    return result;
  }

  // If no subscription end date, do nothing
  if (!member.subscription_end_date) {
    result.action = "skip";
    result.details = "No subscription end date";
    return result;
  }

  const now = new Date();
  const subscriptionEndDate = new Date(member.subscription_end_date);
  const daysUntilExpiration = Math.ceil(
    (subscriptionEndDate.getTime() - now.getTime()) / (1000 * 3600 * 24)
  );

  // Log for debugging
  console.log(`Member ${member.telegram_user_id} has ${daysUntilExpiration} days until expiration`);

  // Check if subscription has expired
  if (daysUntilExpiration <= 0 && member.subscription_status === 'active') {
    // Subscription has expired
    await handleExpiredSubscription(supabase, member, botSettings, result);
    return result;
  }

  // Send reminders if subscription is active and expiration is coming soon
  if (member.subscription_status === 'active') {
    await sendReminderNotifications(supabase, member, botSettings, daysUntilExpiration, result);
  }

  return result;
}

async function handleExpiredSubscription(
  supabase: any,
  member: SubscriptionMember,
  botSettings: BotSettings,
  result: any
) {
  result.action = "expiration";
  result.details = "Subscription expired";

  // Update member status in database
  await supabase
    .from("telegram_chat_members")
    .update({
      subscription_status: 'expired', // Using the string value
    })
    .eq("id", member.id);

  // Log the expiration in activity logs
  await supabase.from("subscription_activity_logs").insert({
    community_id: member.community_id,
    telegram_user_id: member.telegram_user_id,
    activity_type: "subscription_expired",
    details: "Subscription expired automatically",
  });

  // Send expiration notification to member
  if (botSettings.expired_subscription_message) {
    try {
      // Get global bot token
      const { data: settings } = await supabase
        .from("telegram_global_settings")
        .select("bot_token")
        .single();

      if (!settings?.bot_token) {
        throw new Error('Bot token not found');
      }

      // Get community data for mini app URL
      const { data: community } = await supabase
        .from("communities")
        .select("miniapp_url")
        .eq("id", member.community_id)
        .single();

      // Create inline keyboard if mini app URL is available
      let inlineKeyboard = null;
      if (community?.miniapp_url) {
        inlineKeyboard = {
          inline_keyboard: [
            [
              {
                text: "Renew Now!",
                web_app: {
                  url: `${community.miniapp_url}?start=${member.community_id}`
                }
              }
            ]
          ]
        };
      }

      // Send message directly via Telegram API
      const messageSent = await sendDirectTelegramMessage(
        settings.bot_token,
        member.telegram_user_id,
        botSettings.expired_subscription_message + (botSettings.bot_signature ? `\n\n${botSettings.bot_signature}` : ''),
        inlineKeyboard
      );

      if (messageSent) {
        // Log the notification only if message was sent successfully
        await supabase.from("subscription_notifications").insert({
          community_id: member.community_id,
          member_id: member.id,
          notification_type: "expiration",
          status: "sent",
        });
        
        console.log(`✅ Expiration message sent successfully to user ${member.telegram_user_id}`);
      } else {
        console.error(`❌ Failed to send expiration message to user ${member.telegram_user_id}`);
        result.details += ", failed to send notification";
      }
    } catch (error) {
      console.error(`❌ Error sending expiration message to user ${member.telegram_user_id}:`, error);
      result.details += ", failed to send notification: " + error.message;
    }
  }

  // Remove member from chat if auto-remove is enabled
  if (botSettings.auto_remove_expired) {
    try {
      // Get bot token to make direct API call
      const { data: settings } = await supabase
        .from("telegram_global_settings")
        .select("bot_token")
        .single();

      if (!settings?.bot_token) {
        throw new Error('Bot token not found');
      }

      // Make direct API call to kick chat member
      const response = await fetch(
        `https://api.telegram.org/bot${settings.bot_token}/banChatMember`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: member.community_id,
            user_id: member.telegram_user_id,
            revoke_messages: false,
          }),
        }
      );

      const result = await response.json();
      if (!result.ok) {
        console.error("Error removing member from chat:", result);
        throw new Error(result.description || "Failed to remove from chat");
      }

      await supabase.from("telegram_chat_members").update({
        is_active: false,
      }).eq("id", member.id);

      result.details += ", removed from chat";
    } catch (error) {
      console.error("Error removing member from chat:", error);
      result.details += ", failed to remove from chat";
    }
  }
}

async function sendReminderNotifications(
  supabase: any,
  member: SubscriptionMember,
  botSettings: BotSettings,
  daysUntilExpiration: number,
  result: any
) {
  // First check for recent notification of ANY type to prevent spamming
  const startOfDay = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
  const endOfDay = new Date(new Date().setHours(23, 59, 59, 999)).toISOString();
  
  const { data: recentNotifications } = await supabase
    .from("subscription_notifications")
    .select("*")
    .eq("member_id", member.id)
    .gte("sent_at", startOfDay)
    .lt("sent_at", endOfDay);
  
  if (recentNotifications && recentNotifications.length > 0) {
    console.log(`User ${member.telegram_user_id} already received a notification today, skipping all reminders`);
    result.action = "skip";
    result.details = "User already received a notification today";
    return;
  }

  // Get bot token and community data once for all reminder types
  const [tokenResult, communityResult] = await Promise.all([
    supabase.from("telegram_global_settings").select("bot_token").single(),
    supabase.from("communities").select("miniapp_url").eq("id", member.community_id).single()
  ]);

  if (tokenResult.error || !tokenResult.data?.bot_token) {
    console.error("Error fetching bot token:", tokenResult.error);
    result.details = "Failed to fetch bot token";
    return;
  }

  const botToken = tokenResult.data.bot_token;
  const miniAppUrl = communityResult.data?.miniapp_url;

  // Create inline keyboard if mini app URL is available
  let inlineKeyboard = null;
  if (miniAppUrl) {
    inlineKeyboard = {
      inline_keyboard: [
        [
          {
            text: "Renew Now!",
            web_app: {
              url: `${miniAppUrl}?start=${member.community_id}`
            }
          }
        ]
      ]
    };
  }

  // First Reminder
  if (daysUntilExpiration === botSettings.first_reminder_days) {
    console.log(`Sending first reminder to ${member.telegram_user_id}, ${daysUntilExpiration} days before expiration`);
    result.action = "first_reminder";
    result.details = `Sent first reminder (${daysUntilExpiration} days before expiration)`;

    // Send first reminder notification
    try {
      let messageSent = false;
      
      if (botSettings.first_reminder_image) {
        console.log(`Attempting to send image message with first reminder to ${member.telegram_user_id}`);
        console.log(`Image URL/data: ${botSettings.first_reminder_image.substring(0, 30)}...`);
        
        // Send photo message with caption
        messageSent = await sendDirectTelegramPhotoMessage(
          botToken,
          member.telegram_user_id,
          botSettings.first_reminder_image,
          botSettings.first_reminder_message + (botSettings.bot_signature ? `\n\n${botSettings.bot_signature}` : ''),
          inlineKeyboard
        );
        
        if (!messageSent) {
          console.log(`Failed to send image message, falling back to text for user ${member.telegram_user_id}`);
          // If image sending fails, fall back to text message
          messageSent = await sendDirectTelegramMessage(
            botToken,
            member.telegram_user_id,
            botSettings.first_reminder_message + (botSettings.bot_signature ? `\n\n${botSettings.bot_signature}` : ''),
            inlineKeyboard
          );
        }
      } else {
        // Send text message
        messageSent = await sendDirectTelegramMessage(
          botToken,
          member.telegram_user_id,
          botSettings.first_reminder_message + (botSettings.bot_signature ? `\n\n${botSettings.bot_signature}` : ''),
          inlineKeyboard
        );
      }

      if (messageSent) {
        await logSuccessfulNotification(supabase, member, "first_reminder", result);
      } else {
        handleFailedNotification(result, "first reminder");
      }
    } catch (error) {
      console.error(`❌ Error sending first reminder message to user ${member.telegram_user_id}:`, error);
      result.details = "Failed to send first reminder: " + error.message;
    }
  }
  // Second Reminder
  else if (daysUntilExpiration === botSettings.second_reminder_days) {
    console.log(`Sending second reminder to ${member.telegram_user_id}, ${daysUntilExpiration} days before expiration`);
    result.action = "second_reminder";
    result.details = `Sent second reminder (${daysUntilExpiration} days before expiration)`;

    // Send second reminder notification
    try {
      let messageSent = false;
      
      if (botSettings.second_reminder_image) {
        console.log(`Attempting to send image message with second reminder to ${member.telegram_user_id}`);
        console.log(`Image URL/data: ${botSettings.second_reminder_image.substring(0, 30)}...`);
        
        // Send photo message with caption
        messageSent = await sendDirectTelegramPhotoMessage(
          botToken,
          member.telegram_user_id,
          botSettings.second_reminder_image,
          botSettings.second_reminder_message + (botSettings.bot_signature ? `\n\n${botSettings.bot_signature}` : ''),
          inlineKeyboard
        );
        
        if (!messageSent) {
          console.log(`Failed to send image message, falling back to text for user ${member.telegram_user_id}`);
          // If image sending fails, fall back to text message
          messageSent = await sendDirectTelegramMessage(
            botToken,
            member.telegram_user_id,
            botSettings.second_reminder_message + (botSettings.bot_signature ? `\n\n${botSettings.bot_signature}` : ''),
            inlineKeyboard
          );
        }
      } else {
        // Send text message
        messageSent = await sendDirectTelegramMessage(
          botToken,
          member.telegram_user_id,
          botSettings.second_reminder_message + (botSettings.bot_signature ? `\n\n${botSettings.bot_signature}` : ''),
          inlineKeyboard
        );
      }

      if (messageSent) {
        await logSuccessfulNotification(supabase, member, "second_reminder", result);
      } else {
        handleFailedNotification(result, "second reminder");
      }
    } catch (error) {
      console.error(`❌ Error sending second reminder message to user ${member.telegram_user_id}:`, error);
      result.details = "Failed to send second reminder: " + error.message;
    }
  }
  // Legacy reminder (for backward compatibility)
  else if (daysUntilExpiration === botSettings.subscription_reminder_days) {
    console.log(`Sending legacy reminder to ${member.telegram_user_id}, ${daysUntilExpiration} days before expiration`);
    result.action = "legacy_reminder";
    result.details = `Sent legacy reminder (${daysUntilExpiration} days before expiration)`;

    // Only send if days match the original reminder setting
    try {
      const messageSent = await sendDirectTelegramMessage(
        botToken,
        member.telegram_user_id,
        botSettings.subscription_reminder_message + (botSettings.bot_signature ? `\n\n${botSettings.bot_signature}` : ''),
        inlineKeyboard
      );

      if (messageSent) {
        // Log the notification only if message was sent successfully
        await supabase.from("subscription_notifications").insert({
          community_id: member.community_id,
          member_id: member.id,
          notification_type: "reminder",
          status: "sent",
        });
        
        console.log(`✅ Legacy reminder message sent successfully to user ${member.telegram_user_id}`);
      } else {
        console.error(`❌ Failed to send legacy reminder message to user ${member.telegram_user_id}`);
        result.details = "Failed to send legacy reminder";
      }
    } catch (error) {
      console.error(`❌ Error sending legacy reminder message to user ${member.telegram_user_id}:`, error);
      result.details = "Failed to send legacy reminder: " + error.message;
    }
  }
}

// Helper function to log successful notifications
async function logSuccessfulNotification(supabase: any, member: SubscriptionMember, type: string, result: any) {
  // Log the notification in subscription_notifications
  await supabase.from("subscription_notifications").insert({
    community_id: member.community_id,
    member_id: member.id,
    notification_type: type,
    status: "sent",
  });

  // Log in activity logs for first and second reminders
  if (type === "first_reminder" || type === "second_reminder") {
    await supabase.from("subscription_activity_logs").insert({
      community_id: member.community_id,
      telegram_user_id: member.telegram_user_id,
      activity_type: `${type}_sent`,
      details: `${type === "first_reminder" ? "First" : "Second"} reminder sent`,
    });
  }
  
  console.log(`✅ ${type} message sent successfully to user ${member.telegram_user_id}`);
}

// Helper function to handle failed notifications
function handleFailedNotification(result: any, reminderType: string) {
  console.error(`❌ Failed to send ${reminderType} message`);
  result.details = `Failed to send ${reminderType}`;
}

// Function to send text message directly via Telegram API
async function sendDirectTelegramMessage(
  botToken: string,
  chatId: string,
  text: string,
  replyMarkup: any = null
): Promise<boolean> {
  try {
    console.log(`📤 Sending text message to ${chatId}`);
    
    const body: any = {
      chat_id: chatId,
      text: text,
      parse_mode: "HTML"
    };
    
    if (replyMarkup) {
      body.reply_markup = replyMarkup;
    }
    
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      }
    );
    
    const result = await response.json();
    
    if (!result.ok) {
      console.error("Error sending message:", result.description);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error sending message:", error);
    return false;
  }
}

// Function to send photo message directly via Telegram API
async function sendDirectTelegramPhotoMessage(
  botToken: string,
  chatId: string,
  photoUrl: string,
  caption: string = "",
  replyMarkup: any = null
): Promise<boolean> {
  try {
    console.log(`📤 Sending photo message to ${chatId}`);
    
    // Check if the image is a base64 data URL
    if (photoUrl.startsWith('data:image')) {
      console.log(`Base64 image detected, processing as form data...`);
      
      try {
        // Extract the Base64 data (remove the data:image/xxx;base64, prefix)
        const matches = photoUrl.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/);
        
        if (!matches || matches.length !== 3) {
          throw new Error('Invalid base64 image format');
        }
        
        const imageFormat = matches[1]; // e.g., 'jpeg', 'png'
        const base64Data = matches[2];
        
        // Convert Base64 to binary
        const binaryData = atob(base64Data);
        const byteArray = new Uint8Array(binaryData.length);
        
        for (let i = 0; i < binaryData.length; i++) {
          byteArray[i] = binaryData.charCodeAt(i);
        }
        
        // Create form data and blob
        const form = new FormData();
        form.append('chat_id', chatId);
        
        // Create file from binary data
        const blob = new Blob([byteArray], { type: `image/${imageFormat}` });
        form.append('photo', blob, `image.${imageFormat}`);
        
        if (caption) {
          form.append('caption', caption);
          form.append('parse_mode', 'HTML');
        }
        
        if (replyMarkup) {
          form.append('reply_markup', JSON.stringify(replyMarkup));
        }
        
        // Send the request
        const response = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
          method: 'POST',
          body: form
        });
        
        const result = await response.json();
        
        if (!result.ok) {
          console.error('Error sending photo message with form data:', result.description);
          return false;
        }
        
        console.log('Successfully sent base64 image!');
        return true;
        
      } catch (base64Error) {
        console.error('Error processing base64 image:', base64Error);
        // Fall back to text message on base64 processing error
        return await sendDirectTelegramMessage(botToken, chatId, caption, replyMarkup);
      }
    } else {
      // For regular URL images
      console.log(`Standard URL image detected, sending directly...`);
      
      const body: any = {
        chat_id: chatId,
        photo: photoUrl,
        parse_mode: "HTML"
      };
      
      if (caption) {
        body.caption = caption;
      }
      
      if (replyMarkup) {
        body.reply_markup = replyMarkup;
      }
      
      const response = await fetch(
        `https://api.telegram.org/bot${botToken}/sendPhoto`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        }
      );
      
      const result = await response.json();
      
      if (!result.ok) {
        console.error("Error sending photo message:", result.description);
        return false;
      }
      
      return true;
    }
  } catch (error) {
    console.error("Error sending photo message:", error);
    return false;
  }
}
