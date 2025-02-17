import { Context } from "../../_utils/telegramClient.ts";
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Database } from "../../_utils/database.types.ts";

export const handleChatMember = async (
  ctx: Context,
  supabase: SupabaseClient<Database>
) => {
  console.log("Handling chat member update:", ctx.chatMember);

  const { chat, new_chat_member } = ctx.chatMember;

  if (!new_chat_member) {
    console.log("No new chat member info found.");
    return;
  }

  const communityId = chat.id.toString();

  try {
    // Check if the user is already in the database
    const { data: existingMember, error: existingMemberError } = await supabase
      .from('telegram_chat_members')
      .select('*')
      .eq('telegram_user_id', new_chat_member.user.id.toString())
      .eq('community_id', communityId)
      .single();

    if (existingMemberError && existingMemberError.code !== 'PGRST116') {
      console.error("Error checking existing member:", existingMemberError);
      return;
    }

    if (existingMember) {
      console.log("User already exists in the database:", existingMember);
      return;
    }

    // Insert the new member into the database
    const { data, error } = await supabase
      .from('telegram_chat_members')
      .insert({
        community_id: communityId,
        telegram_user_id: new_chat_member.user.id.toString(),
        telegram_username: new_chat_member.user.username,
        joined_at: new Date().toISOString(),
        subscription_status: false, // Set default subscription status
      })
      .select()
      .single();

    if (error) {
      console.error("Error inserting chat member:", error);
      return;
    }

    console.log("Inserted new chat member:", data);

  } catch (error) {
    console.error("Error handling chat member:", error);
  }
};
