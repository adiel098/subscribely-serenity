
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getBotChatMember } from './chatMemberHandler.ts';

export async function updateMemberActivity(supabase: ReturnType<typeof createClient>, communityId: string) {
  try {
    console.log('Updating member activity for community:', communityId);

    const { data: settings } = await supabase
      .from('telegram_global_settings')
      .select('bot_token')
      .single();

    if (!settings?.bot_token) {
      throw new Error('Bot token not found');
    }

    const { data: community } = await supabase
      .from('communities')
      .select('telegram_chat_id')
      .eq('id', communityId)
      .single();

    if (!community?.telegram_chat_id) {
      throw new Error('Community telegram chat id not found');
    }

    const { data: members, error: membersError } = await supabase
      .from('telegram_chat_members')
      .select('telegram_user_id')
      .eq('community_id', communityId);

    if (membersError) throw membersError;

    console.log(`Found ${members.length} members to check`);

    let activeCount = 0;
    let inactiveCount = 0;

    for (const member of members) {
      const canReceiveMessages = await getBotChatMember(
        settings.bot_token,
        community.telegram_chat_id,
        member.telegram_user_id
      );

      if (canReceiveMessages) {
        activeCount++;
      } else {
        inactiveCount++;
      }

      await supabase
        .from('telegram_chat_members')
        .update({
          is_active: canReceiveMessages,
          last_checked: new Date().toISOString()
        })
        .eq('telegram_user_id', member.telegram_user_id)
        .eq('community_id', communityId);

      await new Promise(resolve => setTimeout(resolve, 50));
    }

    console.log('✅ Activity check completed:', {
      totalMembers: members.length,
      activeMembers: activeCount,
      inactiveMembers: inactiveCount
    });
  } catch (error) {
    console.error('Error updating member activity:', error);
    throw error;
  }
}
