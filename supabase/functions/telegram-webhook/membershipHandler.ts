import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { sendTelegramMessage } from './telegramClient.ts';

export async function handleChatMemberUpdate(supabase: ReturnType<typeof createClient>, update: any) {
  try {
    console.log('Handling chat member update:', update);

    const chatId = update.chat_member.chat.id;
    const userId = update.chat_member.from.id;
    const newStatus = update.chat_member.new_chat_member.status;

    console.log(`Chat ID: ${chatId}, User ID: ${userId}, New Status: ${newStatus}`);

    // Fetch community ID associated with the chat
    const { data: community, error: communityError } = await supabase
      .from('communities')
      .select('id')
      .eq('telegram_chat_id', chatId)
      .single();

    if (communityError) {
      console.error('Error fetching community ID:', communityError);
      return;
    }

    if (!community) {
      console.warn(`No community found for chat ID: ${chatId}`);
      return;
    }

    const communityId = community.id;

    // Update or insert the user in the telegram_chat_members table
    const { data, error } = await supabase
      .from('telegram_chat_members')
      .upsert(
        {
          community_id: communityId,
          telegram_user_id: userId.toString(),
          telegram_username: update.chat_member.from.username,
          joined_at: new Date().toISOString(),
          subscription_status: false, // Default status
        },
        { onConflict: 'community_id, telegram_user_id' }
      )
      .select();

    if (error) {
      console.error('Error inserting/updating telegram_chat_members:', error);
      return;
    }

    console.log('Inserted/updated telegram_chat_members:', data);

  } catch (error) {
    console.error('Error in handleChatMemberUpdate:', error);
  }
}

export async function handleChatJoinRequest(supabase: ReturnType<typeof createClient>, update: any) {
  try {
    console.log('Handling chat join request:', update);

    const chatId = update.chat_join_request.chat.id;
    const userId = update.chat_join_request.from.id;

    console.log(`Chat ID: ${chatId}, User ID: ${userId}`);

    // Fetch community ID associated with the chat
    const { data: community, error: communityError } = await supabase
      .from('communities')
      .select('id')
      .eq('telegram_chat_id', chatId)
      .single();

    if (communityError) {
      console.error('Error fetching community ID:', communityError);
      return;
    }

    if (!community) {
      console.warn(`No community found for chat ID: ${chatId}`);
      return;
    }

    const communityId = community.id;

    // Update or insert the user in the telegram_chat_members table
    const { data, error } = await supabase
      .from('telegram_chat_members')
      .upsert(
        {
          community_id: communityId,
          telegram_user_id: userId.toString(),
          telegram_username: update.chat_join_request.from.username,
          joined_at: new Date().toISOString(),
          subscription_status: false, // Default status
        },
        { onConflict: 'community_id, telegram_user_id' }
      )
      .select();

    if (error) {
      console.error('Error inserting/updating telegram_chat_members:', error);
    }

    console.log('Inserted/updated telegram_chat_members:', data);

  } catch (error) {
    console.error('Error in handleChatJoinRequest:', error);
  }
}

export async function handleMyChatMember(supabase: ReturnType<typeof createClient>, update: any) {
  try {
    console.log('Handling my chat member update:', update);

    // Extract relevant information from the update object
    const chatId = update.my_chat_member.chat.id;
    const newStatus = update.my_chat_member.new_chat_member.status;

    console.log(`Chat ID: ${chatId}, New Status: ${newStatus}`);

    // Fetch community ID associated with the chat
    const { data: community, error: communityError } = await supabase
      .from('communities')
      .select('id')
      .eq('telegram_chat_id', chatId)
      .single();

    if (communityError) {
      console.error('Error fetching community ID:', communityError);
      return;
    }

    if (!community) {
      console.warn(`No community found for chat ID: ${chatId}`);
      return;
    }

    const communityId = community.id;

    // Check if the bot was added or removed from the chat
    if (newStatus === 'left' || newStatus === 'kicked') {
      // Bot was removed from the chat, update the community status
      const { error: updateError } = await supabase
        .from('communities')
        .update({ is_active: false })
        .eq('id', communityId);

      if (updateError) {
        console.error('Error updating community status:', updateError);
      } else {
        console.log(`Community ${communityId} set to inactive due to bot removal.`);
      }
    } else if (newStatus === 'administrator' || newStatus === 'member') {
      // Bot was added or re-added to the chat, update the community status
      const { error: updateError } = await supabase
        .from('communities')
        .update({ is_active: true })
        .eq('id', communityId);

      if (updateError) {
        console.error('Error updating community status:', updateError);
      } else {
        console.log(`Community ${communityId} set to active due to bot addition/re-addition.`);
      }
    }
  } catch (error) {
    console.error('Error in handleMyChatMember:', error);
  }
}

export async function updateMemberActivity(supabase: ReturnType<typeof createClient>, communityId: string) {
  try {
    console.log(`Updating member activity for community: ${communityId}`);

    // Fetch all members of the community
    const { data: members, error: membersError } = await supabase
      .from('telegram_chat_members')
      .select('telegram_user_id')
      .eq('community_id', communityId);

    if (membersError) {
      console.error('Error fetching members:', membersError);
      return;
    }

    if (!members || members.length === 0) {
      console.log('No members found for this community.');
      return;
    }

    // Get bot token from settings
    const { data: settings, error: settingsError } = await supabase
      .from('telegram_global_settings')
      .select('bot_token')
      .single();

    if (settingsError) {
      console.error('Error fetching bot token:', settingsError);
      return;
    }

    if (!settings?.bot_token) {
      console.error('Bot token not found in settings');
      return;
    }

    // Iterate through members and check their status
    for (const member of members) {
      const userId = member.telegram_user_id;

      try {
        // Call getChatMember to check user status
        const response = await fetch(
          `https://api.telegram.org/bot${settings.bot_token}/getChatMember`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              chat_id: communityId,
              user_id: userId,
            }),
          }
        );

        const result = await response.json();

        if (result.ok) {
          const status = result.result.status;
          console.log(`User ${userId} status: ${status}`);

          // Update user's subscription status based on chat member status
          const isSubscribed = status === 'member' || status === 'administrator' || status === 'creator' || status === 'restricted';

          // Update the user's subscription status and last_active timestamp in the database
          const { error: updateError } = await supabase
            .from('telegram_chat_members')
            .update({
              subscription_status: isSubscribed,
              last_active: new Date().toISOString(),
            })
            .eq('community_id', communityId)
            .eq('telegram_user_id', userId);

          if (updateError) {
            console.error(`Error updating user ${userId} status:`, updateError);
          } else {
            console.log(`Updated user ${userId} status to ${isSubscribed}`);
          }
        } else {
          console.error(`Failed to get chat member for user ${userId}:`, result.description);
        }
      } catch (error) {
        console.error(`Error checking status for user ${userId}:`, error);
      }
    }

    console.log('Member activity update completed.');
  } catch (error) {
    console.error('Error in updateMemberActivity:', error);
  }
}

export async function getBotChatMember(botToken: string, chatId: string | number, userId: string | number): Promise<boolean> {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/getChatMember`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          user_id: userId,
        }),
      }
    );

    const result = await response.json();
    
    if (!result.ok) {
      console.log(`Bot cannot interact with user ${userId}:`, result.description);
      return false;
    }

    // Check if the user has blocked or deleted the bot
    const status = result.result.status;
    const canReceiveMessages = status !== 'kicked' && status !== 'left' && status !== 'banned';
    
    console.log(`User ${userId} chat member status:`, status);
    console.log(`Can receive messages:`, canReceiveMessages);
    
    return canReceiveMessages;
  } catch (error) {
    console.error(`Error checking chat member status for user ${userId}:`, error);
    return false;
  }
}
