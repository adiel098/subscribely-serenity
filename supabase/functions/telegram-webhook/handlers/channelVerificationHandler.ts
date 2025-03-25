
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { fetchAndUpdateCommunityPhoto } from './utils/photoHandler.ts';

interface TelegramMessage {
  chat: {
    id: number;
    title?: string;
    type: string;
  };
  text?: string;
  from?: {
    id: number;
    username?: string;
  };
}

export async function handleChannelVerification(
  supabase: ReturnType<typeof createClient>,
  message: TelegramMessage,
  botToken: string
): Promise<boolean> {
  try {
    console.log('[Channel] Processing message:', JSON.stringify(message, null, 2));

    // Verify this is a message from a channel or group
    if (!message.chat || !['group', 'supergroup', 'channel'].includes(message.chat.type)) {
      console.log('[Channel] Not a channel/group message');
      return false;
    }

    // Look for verification code in message
    const verificationCodeMatch = message.text?.match(/MBF_([A-Za-z0-9]+)/);
    if (!verificationCodeMatch) {
      console.log('[Channel] No verification code found in message');
      return false;
    }

    const verificationCode = verificationCodeMatch[1];
    console.log('[Channel] Found verification code:', verificationCode);

    // Find matching profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('current_telegram_code', verificationCodeMatch[0])
      .single();

    if (profileError || !profile) {
      console.error('[Channel] No matching profile found:', profileError);
      return false;
    }

    console.log('[Channel] Found matching profile:', profile.id);

    // Check if community already exists
    const { data: existingCommunity } = await supabase
      .from('communities')
      .select('*')
      .eq('telegram_chat_id', String(message.chat.id))
      .single();

    if (existingCommunity) {
      console.log('[Channel] Community already exists:', existingCommunity.id);
      return false;
    }

    // Create new community
    const { data: newCommunity, error: communityError } = await supabase
      .from('communities')
      .insert({
        name: message.chat.title || 'Telegram Community',
        owner_id: profile.id,
        platform: 'telegram',
        telegram_chat_id: String(message.chat.id),
        platform_id: String(message.chat.id),
        chat_type: message.chat.type, // Store the original chat type for reference
        is_group: false // All Telegram entities are regular communities in our platform
      })
      .select()
      .single();

    if (communityError) {
      console.error('[Channel] Error creating community:', communityError);
      return false;
    }

    console.log('[Channel] Created new community:', newCommunity.id);

    // Fetch and update the community photo
    const photoUrl = await fetchAndUpdateCommunityPhoto(
      supabase,
      botToken,
      newCommunity.id,
      String(message.chat.id)
    );
    
    if (photoUrl) {
      console.log('[Channel] Successfully added photo to community:', newCommunity.id);
    } else {
      console.log('[Channel] No photo available or failed to fetch photo for community:', newCommunity.id);
    }

    // Send confirmation message
    try {
      const confirmationMessage = `✅ ${message.chat.type === 'channel' ? 'Channel' : 'Group'} successfully connected!\nCommunity ID: ${newCommunity.id}`;
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: message.chat.id,
          text: confirmationMessage
        })
      });
    } catch (sendError) {
      console.error('[Channel] Error sending confirmation:', sendError);
      // Don't return false as the community was already created successfully
    }

    return true;
  } catch (error) {
    console.error('[Channel] Error processing channel verification:', error);
    return false;
  }
}
