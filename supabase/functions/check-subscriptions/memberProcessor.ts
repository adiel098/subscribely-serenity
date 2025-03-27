
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.2";
import { TelegramMemberManager } from "./utils/memberManager.ts";
import { logSystemEvent } from "./utils/databaseLogger.ts";

// Type definitions for members
export interface Member {
  member_id: string;
  community_id: string;
  telegram_user_id: string;
  subscription_end_date?: string;
  is_active: boolean;
  subscription_status: string;
}

// Type definitions for bot settings
interface BotSettings {
  community_id: string;
  auto_remove_expired: boolean;
  auto_welcome_message: boolean;
  chat_id?: string;
  expired_subscription_message: string;
  renewal_discount_enabled?: boolean;
  renewal_discount_percentage?: number;
}

// Process a member to check their subscription status
export async function processMember(
  supabase: ReturnType<typeof createClient>,
  member: Member,
  botSettings: BotSettings
) {
  const log = {
    memberId: member.member_id,
    telegramUserId: member.telegram_user_id,
    action: "no_action",
    details: "No action needed"
  };

  try {
    // Get current time with hours and minutes for logging
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    console.log(`🔍 [${timeStr}] Processing member ${member.telegram_user_id} for community ${member.community_id}`);
    console.log(`👤 [${timeStr}] Member details: ${JSON.stringify(member, null, 2)}`);

    // Get the community information to access telegram_chat_id
    const { data: community, error: communityError } = await supabase
      .from("communities")
      .select("telegram_chat_id, name")
      .eq("id", member.community_id)
      .single();

    if (communityError) {
      console.error(`❌ [${timeStr}] Error getting community info: ${communityError.message}`);
      log.action = "error";
      log.details = `Failed to get community info: ${communityError.message}`;
      return log;
    }

    console.log(`📋 [${timeStr}] Community info: ${JSON.stringify(community, null, 2)}`);

    // 1. Handle expired subscription members
    if (
      member.is_active &&
      member.subscription_status === "active" &&
      member.subscription_end_date &&
      new Date(member.subscription_end_date) < now
    ) {
      console.log(`⚠️ [${timeStr}] Member ${member.telegram_user_id} has an expired subscription`);
      
      // Update the member record in the database
      const { error: updateError } = await supabase
        .from("community_subscribers")
        .update({
          subscription_status: "expired",
          last_checked: now.toISOString()
        })
        .eq("id", member.member_id);

      if (updateError) {
        console.error(`❌ [${timeStr}] Error updating member status: ${updateError.message}`);
        log.action = "error";
        log.details = `Failed to update member status: ${updateError.message}`;
        return log;
      }

      log.action = "subscription_expired";
      log.details = `Subscription expired on ${member.subscription_end_date}`;

      // If bot settings specify auto-remove, also remove from chat
      if (botSettings.auto_remove_expired && community.telegram_chat_id) {
        try {
          console.log(`🔄 [${timeStr}] Auto-remove is enabled, will try to remove user ${member.telegram_user_id} from chat`);
          
          // Get the bot token
          const { data: settings, error: settingsError } = await supabase
            .from("telegram_global_settings")
            .select("bot_token")
            .single();

          if (settingsError) {
            console.error(`❌ [${timeStr}] Error getting bot token: ${settingsError.message}`);
            log.details += "; Failed to get bot token for removal";
            return log;
          }

          // Create member manager instance
          const memberManager = new TelegramMemberManager(supabase, settings.bot_token);
          
          // Try to kick the member
          const kickResult = await memberManager.kickChatMember(
            community.telegram_chat_id,
            member.telegram_user_id,
            "expired"
          );

          if (kickResult) {
            console.log(`✅ [${timeStr}] Successfully removed member ${member.telegram_user_id} from chat`);
            log.details += "; Member was removed from chat";
            
            // Update the member record as inactive
            await supabase
              .from("community_subscribers")
              .update({
                is_active: false,
                last_checked: now.toISOString()
              })
              .eq("id", member.member_id);
          } else {
            console.warn(`⚠️ [${timeStr}] Failed to remove member ${member.telegram_user_id} from chat`);
            log.details += "; Failed to remove member from chat";
          }
        } catch (kickError) {
          console.error(`❌ [${timeStr}] Error during member removal: ${kickError.message}`);
          log.details += `; Error during removal: ${kickError.message}`;
        }
      }

      // Log the subscription expiration event
      await supabase
        .from("subscription_activity_logs")
        .insert({
          telegram_user_id: member.telegram_user_id,
          community_id: member.community_id,
          activity_type: "subscription_expired",
          details: "Subscription expired and status updated",
          status: "expired"
        });

      return log;
    }

    // 2. Handle members that will expire soon (for notifications)
    if (
      member.is_active &&
      member.subscription_status === "active" &&
      member.subscription_end_date
    ) {
      const endDate = new Date(member.subscription_end_date);
      const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      console.log(`📅 [${timeStr}] Member ${member.telegram_user_id} subscription expires in ${daysUntilExpiry} days`);
      
      if (daysUntilExpiry <= 3 && daysUntilExpiry > 0) {
        // We should send a notification here (implement in a future update)
        log.action = "expiring_soon";
        log.details = `Subscription expires in ${daysUntilExpiry} days`;
        
        // Update the last checked timestamp
        await supabase
          .from("community_subscribers")
          .update({
            last_checked: now.toISOString()
          })
          .eq("id", member.member_id);
      }
    }

    // 3. Handle inactive members that might still be in the group
    // This is a placeholder for future implementation
    if (!member.is_active) {
      console.log(`ℹ️ [${timeStr}] Member ${member.telegram_user_id} is currently marked as inactive`);
      
      // Update the last checked timestamp
      await supabase
        .from("community_subscribers")
        .update({
          last_checked: now.toISOString()
        })
        .eq("id", member.member_id);
      
      log.action = "inactive_member";
      log.details = "Member is marked as inactive";
    }

    return log;
  } catch (error) {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    console.error(`❌ [${timeStr}] Error processing member: ${error.message}`);
    log.action = "error";
    log.details = `Processing error: ${error.message}`;
    return log;
  }
}
