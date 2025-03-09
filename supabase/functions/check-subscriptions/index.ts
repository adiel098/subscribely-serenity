
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
    await sendTelegramMessage(
      supabase,
      member.community_id,
      member.telegram_user_id,
      botSettings.expired_subscription_message,
      null,
      botSettings.bot_signature,
      "Renew Now!"
    );

    // Log the notification
    await supabase.from("subscription_notifications").insert({
      community_id: member.community_id,
      member_id: member.id,
      notification_type: "expiration",
      status: "sent",
    });
  }

  // Remove member from chat if auto-remove is enabled
  if (botSettings.auto_remove_expired) {
    try {
      await supabase.functions.invoke("telegram-webhook", {
        body: {
          path: "/remove-member",
          chat_id: member.community_id,
          user_id: member.telegram_user_id,
        },
      });

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
  // First Reminder
  if (daysUntilExpiration === botSettings.first_reminder_days) {
    console.log(`Sending first reminder to ${member.telegram_user_id}, ${daysUntilExpiration} days before expiration`);
    result.action = "first_reminder";
    result.details = `Sent first reminder (${daysUntilExpiration} days before expiration)`;

    // Check if already notified today
    const { data: existingNotifications } = await supabase
      .from("subscription_notifications")
      .select("*")
      .eq("member_id", member.id)
      .eq("notification_type", "first_reminder")
      .gte("sent_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString())
      .lt("sent_at", new Date(new Date().setHours(23, 59, 59, 999)).toISOString());

    if (existingNotifications && existingNotifications.length > 0) {
      console.log("First reminder already sent today, skipping");
      result.details = "First reminder already sent today";
      return;
    }

    // Send first reminder notification
    await sendTelegramMessage(
      supabase,
      member.community_id,
      member.telegram_user_id,
      botSettings.first_reminder_message,
      botSettings.first_reminder_image,
      botSettings.bot_signature,
      "Renew Now!"
    );

    // Log the notification
    await supabase.from("subscription_notifications").insert({
      community_id: member.community_id,
      member_id: member.id,
      notification_type: "first_reminder",
      status: "sent",
    });

    // Log in activity logs
    await supabase.from("subscription_activity_logs").insert({
      community_id: member.community_id,
      telegram_user_id: member.telegram_user_id,
      activity_type: "first_reminder_sent",
      details: `First reminder sent (${daysUntilExpiration} days before expiration)`,
    });
  }
  // Second Reminder
  else if (daysUntilExpiration === botSettings.second_reminder_days) {
    console.log(`Sending second reminder to ${member.telegram_user_id}, ${daysUntilExpiration} days before expiration`);
    result.action = "second_reminder";
    result.details = `Sent second reminder (${daysUntilExpiration} days before expiration)`;

    // Check if already notified today
    const { data: existingNotifications } = await supabase
      .from("subscription_notifications")
      .select("*")
      .eq("member_id", member.id)
      .eq("notification_type", "second_reminder")
      .gte("sent_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString())
      .lt("sent_at", new Date(new Date().setHours(23, 59, 59, 999)).toISOString());

    if (existingNotifications && existingNotifications.length > 0) {
      console.log("Second reminder already sent today, skipping");
      result.details = "Second reminder already sent today";
      return;
    }

    // Send second reminder notification
    await sendTelegramMessage(
      supabase,
      member.community_id,
      member.telegram_user_id,
      botSettings.second_reminder_message,
      botSettings.second_reminder_image,
      botSettings.bot_signature,
      "Renew Now!"
    );

    // Log the notification
    await supabase.from("subscription_notifications").insert({
      community_id: member.community_id,
      member_id: member.id,
      notification_type: "second_reminder",
      status: "sent",
    });

    // Log in activity logs
    await supabase.from("subscription_activity_logs").insert({
      community_id: member.community_id,
      telegram_user_id: member.telegram_user_id,
      activity_type: "second_reminder_sent",
      details: `Second reminder sent (${daysUntilExpiration} days before expiration)`,
    });
  }
  // Legacy reminder (for backward compatibility)
  else if (daysUntilExpiration === botSettings.subscription_reminder_days) {
    console.log(`Sending legacy reminder to ${member.telegram_user_id}, ${daysUntilExpiration} days before expiration`);
    result.action = "legacy_reminder";
    result.details = `Sent legacy reminder (${daysUntilExpiration} days before expiration)`;

    // Check if already notified today
    const { data: existingNotifications } = await supabase
      .from("subscription_notifications")
      .select("*")
      .eq("member_id", member.id)
      .eq("notification_type", "reminder")
      .gte("sent_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString())
      .lt("sent_at", new Date(new Date().setHours(23, 59, 59, 999)).toISOString());

    if (existingNotifications && existingNotifications.length > 0) {
      console.log("Legacy reminder already sent today, skipping");
      result.details = "Legacy reminder already sent today";
      return;
    }

    // Only send if days match the original reminder setting
    await sendTelegramMessage(
      supabase,
      member.community_id,
      member.telegram_user_id,
      botSettings.subscription_reminder_message,
      null,
      botSettings.bot_signature,
      "Renew Now!"
    );

    // Log the notification
    await supabase.from("subscription_notifications").insert({
      community_id: member.community_id,
      member_id: member.id,
      notification_type: "reminder",
      status: "sent",
    });
  }
}

async function sendTelegramMessage(
  supabase: any,
  communityId: string,
  userId: string,
  message: string,
  imageData: string | null,
  signature: string | null,
  buttonText: string | null
) {
  try {
    // Get subscription payment URL
    const { data: community } = await supabase
      .from("communities")
      .select("telegram_chat_id, miniapp_url")
      .eq("id", communityId)
      .single();

    // Format message with signature if present
    const formattedMessage = signature 
      ? `${message}\n\n${signature}` 
      : message;

    // Send message with or without image
    if (imageData) {
      await supabase.functions.invoke("telegram-webhook", {
        body: {
          path: "/send-photo",
          chat_id: community.telegram_chat_id,
          user_id: userId,
          caption: formattedMessage,
          photo: imageData,
          button_text: buttonText,
          button_url: community.miniapp_url,
        },
      });
    } else {
      await supabase.functions.invoke("telegram-webhook", {
        body: {
          path: "/send-message",
          chat_id: community.telegram_chat_id,
          user_id: userId,
          text: formattedMessage,
          button_text: buttonText,
          button_url: community.miniapp_url,
        },
      });
    }

    // Log message sending in community_logs
    await supabase.from("community_logs").insert({
      community_id: communityId,
      event_type: "notification_sent",
      user_id: userId,
      metadata: {
        message_type: imageData ? "photo_message" : "text_message",
        has_button: buttonText ? true : false,
      },
    });

    return true;
  } catch (error) {
    console.error("Error sending Telegram message:", error);
    return false;
  }
}
