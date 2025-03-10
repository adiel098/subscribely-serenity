
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.2";
import { SubscriptionMember } from "../../types.ts";

export async function removeMemberFromChat(
  supabase: ReturnType<typeof createClient>,
  member: SubscriptionMember,
  result: any,
  reason: 'expired' | 'removed' = 'expired'
): Promise<boolean> {
  try {
    if (!member.telegram_user_id || !member.community_id) {
      console.error("❌ MEMBER REMOVAL: Invalid member data:", member);
      return false;
    }

    console.log(`🚫 MEMBER REMOVAL: Removing user ${member.telegram_user_id} - Reason: ${reason}`);

    // Get bot token for API calls
    const { data: settings, error: tokenError } = await supabase
      .from("telegram_global_settings")
      .select("bot_token")
      .single();

    if (tokenError || !settings?.bot_token) {
      console.error(`❌ MEMBER REMOVAL: Bot token error: ${tokenError?.message || 'No token found'}`);
      return false;
    }

    // Get chat ID from community
    const { data: community, error: communityError } = await supabase
      .from("communities")
      .select("telegram_chat_id")
      .eq("id", member.community_id)
      .single();

    if (communityError || !community?.telegram_chat_id) {
      console.error(`❌ MEMBER REMOVAL: Chat ID error: ${communityError?.message || 'No chat ID found'}`);
      return false;
    }

    // Ban member (temporary)
    try {
      const banResponse = await fetch(
        `https://api.telegram.org/bot${settings.bot_token}/banChatMember`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: community.telegram_chat_id,
            user_id: member.telegram_user_id,
            until_date: Math.floor(Date.now() / 1000) + 40
          }),
        }
      );

      const banResult = await banResponse.json();
      
      if (!banResult.ok) {
        console.error(`❌ MEMBER REMOVAL: Ban failed:`, banResult);
        return false;
      }

      // CRITICAL FIX: Update member status in database using the provided reason parameter
      // This ensures the 'expired' reason is properly maintained instead of being overwritten
      console.log(`⚠️ MEMBER REMOVAL: Updating database with status "${reason}"`);
      
      const { error: updateError } = await supabase
        .from("telegram_chat_members")
        .update({
          is_active: false,
          subscription_status: reason // Critical: Use the provided reason parameter
        })
        .eq("id", member.id);

      if (updateError) {
        console.error(`❌ MEMBER REMOVAL: Status update error:`, updateError);
        return false;
      }

      // Unban after delay
      setTimeout(async () => {
        try {
          await fetch(
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
        } catch (unbanError) {
          console.error(`❌ MEMBER REMOVAL: Unban error:`, unbanError);
        }
      }, 2000);

      return true;
    } catch (error) {
      console.error(`❌ MEMBER REMOVAL: API error:`, error);
      return false;
    }
  } catch (error) {
    console.error(`❌ MEMBER REMOVAL: General error:`, error);
    return false;
  }
}
