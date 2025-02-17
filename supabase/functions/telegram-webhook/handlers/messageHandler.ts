
import { Bot, Context } from "https://deno.land/x/grammy@v1.21.1/mod.ts";
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Database } from "../../_utils/database.types.ts";

export const handleMessage = async (
  bot: Bot,
  ctx: Context,
  supabase: SupabaseClient<Database>,
) => {
  console.log("Handling message event:", ctx.message);

  // טיפול בפקודת start
  if (ctx.message?.text?.startsWith("/start")) {
    const communityId = ctx.message.text.split(" ")[1]; // מקבל את ה-ID אחרי הפקודה
    
    if (communityId) {
      console.log(`Processing start command for community: ${communityId}`);
      
      try {
        // מציאת הקהילה
        const { data: community, error: communityError } = await supabase
          .from("communities")
          .select("*")
          .eq("id", communityId)
          .single();

        if (communityError) {
          console.error("Error fetching community:", communityError);
          await ctx.reply("Sorry, I couldn't find this community. Please try again later.");
          return;
        }

        if (!community) {
          console.log("Community not found");
          await ctx.reply("Sorry, I couldn't find this community.");
          return;
        }

        // שליחת הודעת ברוכים הבאים עם כפתור לקנייה
        await ctx.reply(
          `Welcome to ${community.name}! 👋\n\n` +
          `To join this community, please select a subscription plan:`,
          {
            reply_markup: {
              inline_keyboard: [[
                {
                  text: "View Subscription Plans",
                  url: `https://t.me/membifybot/app?startapp=${communityId}`
                }
              ]]
            }
          }
        );

        // רישום האירוע
        await logEvent(supabase, communityId, "member_joined", ctx.from?.id?.toString() || null, {
          username: ctx.from?.username,
          first_name: ctx.from?.first_name,
          last_name: ctx.from?.last_name
        });

      } catch (error) {
        console.error("Error processing start command:", error);
        await ctx.reply("Sorry, something went wrong. Please try again later.");
      }
    } else {
      await ctx.reply("Welcome to Membify! Please use the complete invite link to join a community.");
    }
    return;
  }

  // Handle other message types
  if (ctx.message?.new_chat_members) {
    console.log("New chat members:", ctx.message.new_chat_members);
    return;
  }

  if (ctx.message?.left_chat_member) {
    console.log("Left chat member:", ctx.message.left_chat_member);
    return;
  }

  console.log("Unhandled message:", ctx.message);
};

// Helper function to log events
const logEvent = async (
  supabase: SupabaseClient<Database>,
  communityId: string,
  eventType: "member_joined" | "member_left" | "notification_sent" | "payment_received",
  userId: string | null,
  metadata: Record<string, any> = {}
) => {
  try {
    const { error } = await supabase
      .from("community_logs")
      .insert({
        community_id: communityId,
        event_type: eventType,
        user_id: userId,
        metadata
      });

    if (error) {
      console.error("Error logging event:", error);
    }
  } catch (error) {
    console.error("Error in logEvent:", error);
  }
};
