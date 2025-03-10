
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.2";
import { SubscriptionMember } from "../../types.ts";

/**
 * Removes a member from the chat
 */
export async function removeMemberFromChat(
  supabase: ReturnType<typeof createClient>,
  member: SubscriptionMember,
  result: any
): Promise<void> {
  try {
    if (!member || !member.telegram_user_id || !member.community_id) {
      console.error("❌ Invalid member data for removal:", member);
      result.details += ", failed to remove from chat: invalid member data";
      return;
    }

    console.log(`🚫 MEMBER REMOVAL: Starting removal process for user ${member.telegram_user_id} from community ${member.community_id}`);

    // Get bot token to make direct API call
    const { data: settings, error: tokenError } = await supabase
      .from("telegram_global_settings")
      .select("bot_token")
      .single();

    if (tokenError || !settings?.bot_token) {
      console.error(`❌ Failed to get bot token: ${tokenError ? tokenError.message : 'Bot token not found'}`);
      throw new Error(tokenError ? tokenError.message : 'Bot token not found');
    }

    // Get Telegram chat ID for community
    const { data: community, error: communityError } = await supabase
      .from("communities")
      .select("telegram_chat_id, name")
      .eq("id", member.community_id)
      .single();
      
    if (communityError || !community?.telegram_chat_id) {
      console.error(`❌ Failed to get chat ID: ${communityError ? communityError.message : 'Telegram chat ID not found'}`);
      throw new Error(communityError ? communityError.message : 'Telegram chat ID not found');
    }

    console.log(`🔄 Removing user ${member.telegram_user_id} from chat ${community.telegram_chat_id} (${community.name || member.community_id})`);

    // Make direct API call to kick chat member
    console.log(`📤 Sending API request to ban user ${member.telegram_user_id} from chat ${community.telegram_chat_id}`);
    const response = await fetch(
      `https://api.telegram.org/bot${settings.bot_token}/banChatMember`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: community.telegram_chat_id,
          user_id: member.telegram_user_id,
          revoke_messages: false,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ HTTP error ${response.status}: ${errorText}`);
      throw new Error(`HTTP error ${response.status}: ${errorText}`);
    }

    const kickResult = await response.json();
    console.log(`📥 Ban API response: ${JSON.stringify(kickResult, null, 2)}`);
    
    if (!kickResult.ok) {
      console.error("❌ Error removing member from chat:", kickResult);
      throw new Error(kickResult.description || "Failed to remove from chat");
    }

    console.log(`✅ User ${member.telegram_user_id} successfully banned from chat ${community.telegram_chat_id}`);

    // Update member status in database
    console.log(`📝 Updating member status in database to inactive`);
    const { error: updateError } = await supabase
      .from("telegram_chat_members")
      .update({
        is_active: false,
      })
      .eq("id", member.id);
      
    if (updateError) {
      console.error("❌ Error updating member status after removal:", updateError);
      result.details += ", removed from chat but failed to update status";
    } else {
      console.log(`✅ Successfully updated member status to inactive in database`);
      result.details += ", removed from chat";
    }

    // Log the removal in activity log
    console.log(`📊 Logging member removal in activity logs`);
    const { error: logError } = await supabase
      .from("subscription_activity_logs")
      .insert({
        community_id: member.community_id,
        telegram_user_id: member.telegram_user_id,
        activity_type: "member_removed",
        details: "Member removed automatically due to expired subscription"
      });
      
    if (logError) {
      console.error("❌ Error logging member removal:", logError);
    } else {
      console.log(`✅ Successfully logged member removal in activity logs`);
    }
  } catch (error) {
    console.error("❌ Error removing member from chat:", error);
    result.details += ", failed to remove from chat: " + error.message;
  }
}
