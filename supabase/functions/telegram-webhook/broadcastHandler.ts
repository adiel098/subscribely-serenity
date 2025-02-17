
import { Bot } from "https://deno.land/x/grammy@v1.21.1/mod.ts";
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Database } from "../_utils/database.types.ts";

export const handleBroadcast = async (
  bot: Bot,
  supabase: SupabaseClient<Database>,
  communityId: string,
  message: string,
  filterType: 'all' | 'active' | 'expired' | 'plan',
  subscriptionPlanId?: string,
  includeButton?: boolean
) => {
  console.log('Starting broadcast handler:', {
    communityId,
    filterType,
    subscriptionPlanId,
    includeButton
  });

  try {
    // קבלת פרטי הקהילה
    const { data: community, error: communityError } = await supabase
      .from('communities')
      .select('*')
      .eq('id', communityId)
      .single();

    if (communityError || !community) {
      console.error('Error fetching community:', communityError);
      throw new Error('Community not found');
    }

    // שליחת ההודעה לכל המשתמשים הרלוונטיים
    let successCount = 0;
    let failureCount = 0;
    let totalRecipients = 0;

    // בשלב זה שולחים רק לצ'אט של הקהילה
    if (community.chat_id) {
      totalRecipients = 1;
      try {
        await bot.api.sendMessage(community.chat_id, message, {
          parse_mode: 'HTML',
          ...(includeButton && {
            reply_markup: {
              inline_keyboard: [[
                {
                  text: "View Plans",
                  url: `https://t.me/membifybot/app?startapp=${communityId}`
                }
              ]]
            }
          })
        });
        successCount++;
      } catch (error) {
        console.error('Error sending message:', error);
        failureCount++;
      }
    }

    return {
      successCount,
      failureCount,
      totalRecipients
    };
  } catch (error) {
    console.error('Error in broadcast handler:', error);
    throw error;
  }
};
