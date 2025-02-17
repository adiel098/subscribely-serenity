
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../cors.ts";

export const handleActivityUpdate = async (
  body: any,
  supabase: SupabaseClient,
  corsHeaders: Record<string, string>
) => {
  try {
    const { communityId } = body;

    if (!communityId) {
      return new Response(
        JSON.stringify({ error: 'Community ID is required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    console.log("Updating member activity for community:", communityId);
    
    // עדכון הפעילות האחרונה של המשתמשים
    const { error } = await supabase
      .from("telegram_chat_members")
      .update({ last_checked: new Date().toISOString() })
      .eq("community_id", communityId);

    if (error) {
      console.error("Error updating member activity:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error in handleActivityUpdate:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
};
