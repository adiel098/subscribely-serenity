
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

    // Call the dedicated kick-member function with the explicit reason parameter
    try {
      console.log(`📞 MEMBER REMOVAL: Calling kick-member function with reason: ${reason}`);
      
      const response = await fetch(
        `${Deno.env.get("SUPABASE_URL")}/functions/v1/kick-member`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json", 
            "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`
          },
          body: JSON.stringify({
            memberId: member.id,
            reason: reason // Explicitly pass the reason
          })
        }
      );

      const responseData = await response.json();
      
      if (!responseData.success) {
        console.error(`❌ MEMBER REMOVAL: kick-member call failed:`, responseData);
        return false;
      }
      
      console.log(`✅ MEMBER REMOVAL: Successfully removed user with status "${responseData.reason}"`);
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
