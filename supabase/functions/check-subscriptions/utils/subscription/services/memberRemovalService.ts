
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.2";
import { SubscriptionMember } from "../../types.ts";

/**
 * Removes a member from the chat
 * @param reason - The reason for removal ('expired' or 'removed')
 * @returns boolean indicating success or failure
 */
export async function removeMemberFromChat(
  supabase: ReturnType<typeof createClient>,
  member: SubscriptionMember,
  result: any,
  reason: 'expired' | 'removed' = 'expired'
): Promise<boolean> {
  try {
    if (!member || !member.telegram_user_id || !member.community_id) {
      console.error("❌ MEMBER REMOVAL: Invalid member data for removal:", member);
      result.details += ", failed to remove from chat: invalid member data";
      return false;
    }

    console.log(`🚫 MEMBER REMOVAL: Starting removal process for user ${member.telegram_user_id} from community ${member.community_id}`);
    console.log(`📋 MEMBER REMOVAL: Removal reason: ${reason}`);
    console.log(`📋 MEMBER REMOVAL: Full member data: ${JSON.stringify(member, null, 2)}`);

    // Get bot token to make direct API call
    const { data: settings, error: tokenError } = await supabase
      .from("telegram_global_settings")
      .select("bot_token")
      .single();

    if (tokenError || !settings?.bot_token) {
      console.error(`❌ MEMBER REMOVAL: Failed to get bot token: ${tokenError ? tokenError.message : 'Bot token not found'}`);
      result.details += ", failed to remove from chat: could not get bot token";
      return false;
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
      result.details += ", failed to remove from chat: could not get chat ID";
      return false;
    }
    console.log(`✅ MEMBER REMOVAL: Retrieved community data - Chat ID: ${community.telegram_chat_id}, Name: ${community.name || 'Unknown'}`);

    console.log(`🔄 MEMBER REMOVAL: Removing user ${member.telegram_user_id} from chat ${community.telegram_chat_id} (${community.name || member.community_id})`);

    // Make direct API call to kick chat member
    console.log(`📤 MEMBER REMOVAL: Sending API request to ban user ${member.telegram_user_id} from chat ${community.telegram_chat_id}`);
    try {
      const response = await fetch(
        `https://api.telegram.org/bot${settings.bot_token}/banChatMember`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: community.telegram_chat_id,
            user_id: member.telegram_user_id,
            revoke_messages: false,
            until_date: Math.floor(Date.now() / 1000) + 40, // Ban for only 40 seconds
          }),
        }
      );

      console.log(`📥 MEMBER REMOVAL: Received response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ MEMBER REMOVAL: HTTP error ${response.status}: ${errorText}`);
        result.details += `, failed to remove from chat: HTTP error ${response.status}`;
        return false;
      }

      const kickResult = await response.json();
      console.log(`📥 MEMBER REMOVAL: Ban API complete response: ${JSON.stringify(kickResult, null, 2)}`);
      
      if (!kickResult.ok) {
        console.error(`❌ MEMBER REMOVAL: Error removing member from chat: ${JSON.stringify(kickResult, null, 2)}`);
        result.details += `, failed to remove from chat: ${kickResult.description || "API error"}`;
        return false;
      }

      console.log(`✅ MEMBER REMOVAL: User ${member.telegram_user_id} successfully banned from chat ${community.telegram_chat_id}`);
      
      // Unban the user after a short delay to allow them to rejoin in the future
      setTimeout(async () => {
        try {
          console.log(`🔄 MEMBER REMOVAL: Starting unban process for user ${member.telegram_user_id}`);
          const unbanResponse = await fetch(
            `https://api.telegram.org/bot${settings.bot_token}/unbanChatMember`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: community.telegram_chat_id,
                user_id: member.telegram_user_id,
                only_if_banned: true
              }),
            }
          );

          if (!unbanResponse.ok) {
            const unbanErrorText = await unbanResponse.text();
            console.error(`❌ MEMBER REMOVAL: HTTP error during unban ${unbanResponse.status}: ${unbanErrorText}`);
            return;
          }

          const unbanResult = await unbanResponse.json();
          
          if (unbanResult.ok) {
            console.log(`✅ MEMBER REMOVAL: Successfully unbanned user ${member.telegram_user_id} from chat ${community.telegram_chat_id}`);
          } else {
            console.error(`❌ MEMBER REMOVAL: Failed to unban user: ${JSON.stringify(unbanResult, null, 2)}`);
          }
        } catch (unbanError) {
          console.error(`❌ MEMBER REMOVAL: Error in unban process: ${unbanError.message}`);
        }
      }, 2000); // Wait 2 seconds after ban before unbanning
    } catch (apiError) {
      console.error(`❌ MEMBER REMOVAL: API call error: ${apiError.message}`, apiError);
      result.details += `, failed to remove from chat: API error - ${apiError.message}`;
      return false;
    }

    // Update member status in database - now preserving the reason
    try {
      console.log(`📝 MEMBER REMOVAL: Updating member status in database to ${reason} - Member ID: ${member.id}`);
      const { error: updateError } = await supabase
        .from("telegram_chat_members")
        .update({
          is_active: false,
          subscription_status: reason // This ensures we set the correct status based on the reason
        })
        .eq("id", member.id);
        
      if (updateError) {
        console.error(`❌ MEMBER REMOVAL: Error updating member status after removal: ${updateError.message}`);
        console.error(`❌ MEMBER REMOVAL: Update query details - Table: telegram_chat_members, ID: ${member.id}`);
        result.details += ", removed from chat but failed to update status";
      } else {
        console.log(`✅ MEMBER REMOVAL: Successfully updated member status to ${reason} in database`);
        result.details += ", removed from chat and database updated";
      }
    } catch (dbError) {
      console.error(`❌ MEMBER REMOVAL: Database error: ${dbError.message}`, dbError);
      result.details += ", removed from chat but database update failed";
    }

    // Log the removal in activity log with specific reason
    try {
      console.log(`📊 MEMBER REMOVAL: Logging member removal in activity logs`);
      const { error: logError } = await supabase
        .from("subscription_activity_logs")
        .insert({
          community_id: member.community_id,
          telegram_user_id: member.telegram_user_id,
          activity_type: reason === 'expired' ? 'subscription_expired' : 'member_removed',
          details: reason === 'expired' 
            ? "Member removed automatically due to expired subscription"
            : "Member removed manually by community administrator"
        });
        
      if (logError) {
        console.error(`❌ MEMBER REMOVAL: Error logging member removal: ${logError.message}`);
      } else {
        console.log(`✅ MEMBER REMOVAL: Successfully logged member removal in activity logs`);
      }
    } catch (logError) {
      console.error(`❌ MEMBER REMOVAL: Logging error: ${logError.message}`, logError);
    }
    
    console.log(`🏁 MEMBER REMOVAL: Completed removal process for user ${member.telegram_user_id}`);
    return true;
  } catch (error) {
    console.error(`❌ MEMBER REMOVAL: Unhandled error removing member from chat: ${error.message}`);
    console.error(`❌ MEMBER REMOVAL: Error stack: ${error.stack}`);
    result.details += ", failed to remove from chat: " + error.message;
    return false;
  }
}
