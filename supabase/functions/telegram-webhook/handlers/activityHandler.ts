
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Database } from "../../_utils/database.types.ts";

export const updateMemberActivity = async (
  supabase: SupabaseClient<Database>,
  communityId: string
) => {
  try {
    console.log("Updating member activity for community:", communityId);
    
    // עדכון הפעילות האחרונה של המשתמשים
    const { error } = await supabase
      .from("telegram_chat_members")
      .update({ last_checked: new Date().toISOString() })
      .eq("community_id", communityId);

    if (error) {
      console.error("Error updating member activity:", error);
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error("Error in updateMemberActivity:", error);
    throw error;
  }
};
