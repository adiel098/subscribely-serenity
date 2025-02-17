
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
        // מציאת הקהילה והגדרות הבוט שלה
        const { data: communityData, error: communityError } = await supabase
          .from("communities")
          .select(`
            *,
            telegram_bot_settings (
              welcome_message
            )
          `)
          .eq("id", communityId)
          .single();

        if (communityError) {
          console.error("Error fetching community:", communityError);
          await ctx.reply("Sorry, I couldn't find this community. Please try again later.");
          return;
        }

        if (!communityData) {
          console.log("Community not found");
          await ctx.reply("Sorry, I couldn't find this community.");
          return;
        }

        const welcomeMessage = communityData.telegram_bot_settings?.welcome_message || 
          `Welcome to ${communityData.name}! 👋\n\nTo join this community, please select a subscription plan:`;

        // שליחת הודעת ברוכים הבאים עם כפתור לקנייה
        await ctx.reply(welcomeMessage, {
          reply_markup: {
            inline_keyboard: [[
              {
                text: "View Subscription Plans",
                url: `https://t.me/membifybot/app?startapp=${communityId}`
              }
            ]]
          }
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

  // Handle new members joining the channel/group
  if (ctx.message?.new_chat_members) {
    console.log("New chat members:", ctx.message.new_chat_members);
    
    // Get chat ID for the community
    const chatId = ctx.message.chat.id.toString();
    
    try {
      // Find the community by telegram_chat_id
      const { data: community, error: communityError } = await supabase
        .from("communities")
        .select(`
          id,
          name,
          telegram_bot_settings (
            welcome_message
          )
        `)
        .eq("telegram_chat_id", chatId)
        .single();

      if (communityError || !community) {
        console.error("Error finding community:", communityError);
        return;
      }

      // שליחת הודעה פרטית לכל חבר חדש
      for (const member of ctx.message.new_chat_members) {
        if (!member.is_bot) {  // רק למשתמשים אמיתיים, לא לבוטים
          try {
            const welcomeMessage = community.telegram_bot_settings?.welcome_message || 
              `Welcome to ${community.name}! 👋\n\nTo access all community features, please select a subscription plan:`;

            // שליחת הודעה פרטית למשתמש
            await bot.api.sendMessage(member.id, welcomeMessage, {
              reply_markup: {
                inline_keyboard: [[
                  {
                    text: "View Subscription Plans",
                    url: `https://t.me/membifybot/app?startapp=${community.id}`
                  }
                ]]
              }
            });

            // רישום האירוע
            await logEvent(supabase, community.id, "member_joined", member.id.toString(), {
              username: member.username,
              first_name: member.first_name,
              last_name: member.last_name
            });
          } catch (error) {
            console.error(`Error sending welcome message to user ${member.id}:`, error);
          }
        }
      }
    } catch (error) {
      console.error("Error handling new chat members:", error);
    }
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
