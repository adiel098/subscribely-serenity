
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export async function kickMember(
  supabase: SupabaseClient,
  chatId: string | number,
  userId: string | number,
  botToken: string
): Promise<boolean> {
  try {
    console.log(`[KickMember] Attempting to kick user ${userId} from chat ${chatId}`);
    
    // Call Telegram API to ban the user
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/banChatMember`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          user_id: userId,
          revoke_messages: false,
        }),
      }
    );

    const data = await response.json();
    
    if (!data.ok) {
      console.error("[KickMember] Telegram API error:", data);
      return false;
    }

    console.log(`[KickMember] User ${userId} kicked from chat ${chatId} successfully`);
    
    // Update the user's status in our database
    const { error: updateError } = await supabase
      .from("telegram_chat_members")
      .update({ is_active: false })
      .eq("telegram_user_id", userId.toString())
      .eq("community_id", (await getCommunityIdFromChatId(supabase, chatId)));

    if (updateError) {
      console.error("[KickMember] Error updating user status:", updateError);
    }

    return true;
  } catch (error) {
    console.error("[KickMember] Error:", error);
    return false;
  }
}

async function getCommunityIdFromChatId(
  supabase: SupabaseClient,
  chatId: string | number
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from("communities")
      .select("id")
      .eq("telegram_chat_id", chatId.toString())
      .single();

    if (error || !data) {
      console.error("[KickMember] Error fetching community id:", error);
      return null;
    }

    return data.id;
  } catch (error) {
    console.error("[KickMember] Error in getCommunityIdFromChatId:", error);
    return null;
  }
}
