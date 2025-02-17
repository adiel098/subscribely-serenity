
import { Context } from "https://deno.land/x/grammy@v1.21.1/mod.ts";
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Database } from "../../_utils/database.types.ts";

export const handleJoinRequest = async (
  ctx: Context,
  supabase: SupabaseClient<Database>
) => {
  console.log("Handling join request:", ctx.chatJoinRequest);
  // הלוגיקה הקיימת תישאר כפי שהיא
};
