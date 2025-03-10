
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
    console.log(`📋 MEMBER REMOVAL: Full member data: ${JSON.stringify(member, null, 2)}`);
    console.log(`📋 MEMBER REMOVAL: Current result object: ${JSON.stringify(result, null, 2)}`);

    // Get bot token to make direct API call
    const { data: settings, error: tokenError } = await supabase
      .from("telegram_global_settings")
      .select("bot_token")
      .single();

    if (tokenError || !settings?.bot_token) {
      console.error(`❌ MEMBER REMOVAL: Failed to get bot token: ${tokenError ? tokenError.message : 'Bot token not found'}`);
      throw new Error(tokenError ? tokenError.message : 'Bot token not found');
    }
    console.log(`✅ MEMBER REMOVAL: Successfully retrieved bot token`);

    // Get Telegram chat ID for community
    const { data: community, error: communityError } = await supabase
      .from("communities")
      .select("telegram_chat_id, name")
      .eq("id", member.community_id)
      .single();
      
    if (communityError || !community?.telegram_chat_id) {
      console.error(`❌ MEMBER REMOVAL: Failed to get chat ID: ${communityError ? communityError.message : 'Telegram chat ID not found'}`);
      throw new Error(communityError ? communityError.message : 'Telegram chat ID not found');
    }
    console.log(`✅ MEMBER REMOVAL: Retrieved community data - Chat ID: ${community.telegram_chat_id}, Name: ${community.name || 'Unknown'}`);

    console.log(`🔄 MEMBER REMOVAL: Removing user ${member.telegram_user_id} from chat ${community.telegram_chat_id} (${community.name || member.community_id})`);

    // Make direct API call to kick chat member
    console.log(`📤 MEMBER REMOVAL: Sending API request to ban user ${member.telegram_user_id} from chat ${community.telegram_chat_id}`);
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

    console.log(`📥 MEMBER REMOVAL: Received response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ MEMBER REMOVAL: HTTP error ${response.status}: ${errorText}`);
      throw new Error(`HTTP error ${response.status}: ${errorText}`);
    }

    const kickResult = await response.json();
    console.log(`📥 MEMBER REMOVAL: Ban API complete response: ${JSON.stringify(kickResult, null, 2)}`);
    
    if (!kickResult.ok) {
      console.error(`❌ MEMBER REMOVAL: Error removing member from chat: ${JSON.stringify(kickResult, null, 2)}`);
      throw new Error(kickResult.description || "Failed to remove from chat");
    }

    console.log(`✅ MEMBER REMOVAL: User ${member.telegram_user_id} successfully banned from chat ${community.telegram_chat_id}`);

    // Update member status in database
    console.log(`📝 MEMBER REMOVAL: Updating member status in database to inactive - Member ID: ${member.id}`);
    const { error: updateError } = await supabase
      .from("telegram_chat_members")
      .update({
        is_active: false,
        subscription_status: "expired" // Ensure status matches what was set in expirationHandler
      })
      .eq("id", member.id);
      
    if (updateError) {
      console.error(`❌ MEMBER REMOVAL: Error updating member status after removal: ${updateError.message}`);
      console.error(`❌ MEMBER REMOVAL: Update query details - Table: telegram_chat_members, ID: ${member.id}`);
      result.details += ", removed from chat but failed to update status";
    } else {
      console.log(`✅ MEMBER REMOVAL: Successfully updated member status to inactive in database`);
      result.details += ", removed from chat and database updated";
    }

    // Log the removal in activity log
    console.log(`📊 MEMBER REMOVAL: Logging member removal in activity logs`);
    const { error: logError } = await supabase
      .from("subscription_activity_logs")
      .insert({
        community_id: member.community_id,
        telegram_user_id: member.telegram_user_id,
        activity_type: "member_removed",
        details: "Member removed automatically due to expired subscription"
      });
      
    if (logError) {
      console.error(`❌ MEMBER REMOVAL: Error logging member removal: ${logError.message}`);
    } else {
      console.log(`✅ MEMBER REMOVAL: Successfully logged member removal in activity logs`);
    }
    
    console.log(`🏁 MEMBER REMOVAL: Completed removal process for user ${member.telegram_user_id}`);
  } catch (error) {
    console.error(`❌ MEMBER REMOVAL: Error removing member from chat: ${error.message}`);
    console.error(`❌ MEMBER REMOVAL: Error stack: ${error.stack}`);
    result.details += ", failed to remove from chat: " + error.message;
  }
}
