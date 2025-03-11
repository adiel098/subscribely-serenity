
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { fetchStartCommandData } from './utils/dataSources.ts';
import { logUserInteraction } from './utils/logHelper.ts';
import { sendTelegramMessage } from '../utils/telegramMessenger.ts';
import { findCommunityByIdOrLink } from '../communityHandler.ts';

/**
 * Handle /start command with optional parameters
 * Now supports both community and group identifiers
 */
export async function handleStartCommand(
  supabase: ReturnType<typeof createClient>,
  message: any,
  botToken: string
): Promise<boolean> {
  try {
    console.log('🚀 [START-COMMAND] Processing command with message:', JSON.stringify(message, null, 2));

    // Extract the parameter from /start command
    // Format: /start OR /start param1_param2 OR /start group_uuid
    const text = message.text || '';
    const parts = text.split(' ');
    
    console.log(`[START-COMMAND] 📝 Command parts: ${JSON.stringify(parts)}`);
    
    // If no parameters, just send a welcome message
    if (parts.length === 1 || !parts[1]) {
      console.log('[START-COMMAND] ℹ️ No parameters provided in start command');
      await sendTelegramMessage(
        botToken,
        message.chat.id,
        'Welcome to MembershipBot! 🚀\n\nTo get started, visit our website and connect your community.',
        null  // No photo
      );
      
      // Log the interaction
      await logUserInteraction(
        supabase,
        'start_command_basic',
        message.from.id.toString(),
        message.from.username,
        text,
        message
      );
      
      return true;
    }
    
    // Handle parameterized start command
    const startParam = parts[1];
    console.log(`[START-COMMAND] 🔍 Processing start parameter: ${startParam}`);
    
    // Check if this is a group command (starts with "group_")
    if (startParam.startsWith('group_')) {
      return await handleGroupStartCommand(supabase, message, botToken, startParam.substring(6));
    }
    
    // Handle regular community start command
    // First, try to find community by custom_link
    let communityId = startParam;
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(startParam);
    
    // If it's not a UUID, try to find by custom_link
    if (!isUUID) {
      console.log(`[START-COMMAND] 🔍 Parameter is not a UUID, checking custom_link: ${startParam}`);
      const { data: communityData, error: linkError } = await supabase
        .from('communities')
        .select('id')
        .eq('custom_link', startParam)
        .single();
      
      if (linkError || !communityData) {
        console.log(`[START-COMMAND] ❌ No community found with custom_link: ${startParam}`);
        await sendTelegramMessage(
          botToken,
          message.chat.id,
          `Sorry, I couldn't find that community. 😕\n\nPlease check the link and try again.`,
          null  // No photo
        );
        
        await logUserInteraction(
          supabase,
          'start_command_invalid_community',
          message.from.id.toString(),
          message.from.username,
          text,
          {message, error: linkError?.message || 'No community found with this custom link'}
        );
        
        return true;
      }
      
      // Update communityId with the actual UUID
      communityId = communityData.id;
      console.log(`[START-COMMAND] ✅ Found community with ID: ${communityId} for custom_link: ${startParam}`);
    }
    
    // Fetch community data with the resolved communityId
    const dataResult = await fetchStartCommandData(supabase, communityId);
    console.log(`[START-COMMAND] Data fetch result:`, JSON.stringify(dataResult, null, 2));
    
    if (!dataResult.success) {
      console.error(`[START-COMMAND] ❌ Error fetching data: ${dataResult.error}`);
      
      await sendTelegramMessage(
        botToken,
        message.chat.id,
        `Sorry, I couldn't find that community. 😕\n\nPlease check the link and try again.`,
        null  // No photo
      );
      
      await logUserInteraction(
        supabase,
        'start_command_invalid_community',
        message.from.id.toString(),
        message.from.username,
        text,
        {message, error: dataResult.error}
      );
      
      return true;
    }
    
    const { community, botSettings } = dataResult;
    console.log(`[START-COMMAND] 📋 Community found: ${community.name}`);
    
    // Construct welcome message
    let welcomeMessage = botSettings.welcome_message || 
      `Welcome to ${community.name}! 🎉\n\nTo access this community, you need to purchase a subscription.`;
    
    const miniAppUrl = community.miniapp_url || "https://preview--subscribely-serenity.lovable.app/telegram-mini-app";
    const welcomeImage = botSettings.welcome_image || null;
    
    // Add call-to-action button
    const inlineKeyboard = {
      inline_keyboard: [
        [
          {
            text: "Join Community🚀",
            web_app: {
              url: `${miniAppUrl}?start=${community.id}`
            }
          }
        ]
      ]
    };
    
    console.log(`[START-COMMAND] 📤 Sending welcome message with image: ${!!welcomeImage}`);
    console.log(`[START-COMMAND] 🔗 Mini app URL: ${miniAppUrl}?start=${community.id}`);
    
    // Send welcome message with photo if available
    await sendTelegramMessage(
      botToken,
      message.chat.id,
      welcomeMessage,
      welcomeImage,
      inlineKeyboard
    );
    
    // Log the interaction
    await logUserInteraction(
      supabase,
      'start_command_community',
      message.from.id.toString(),
      message.from.username,
      text,
      {message, community_id: community.id}
    );
    
    return true;
    
  } catch (error) {
    console.error('[START-COMMAND] ❌ Error in handleStartCommand:', error);
    
    try {
      // Log the error
      await supabase.from('telegram_errors').insert({
        error_type: 'start_command_error',
        error_message: error.message,
        stack_trace: error.stack,
        raw_data: message
      });
      
      // Try to send an error message to the user
      await sendTelegramMessage(
        botToken,
        message.chat.id,
        `Sorry, something went wrong processing your request. 😕\n\nPlease try again later.`,
        null  // No photo
      );
    } catch (logError) {
      console.error('[START-COMMAND] ❌ Error logging the original error:', logError);
    }
    
    return false;
  }
}

/**
 * Handle the /start command when a group ID is provided
 */
async function handleGroupStartCommand(
  supabase: ReturnType<typeof createClient>,
  message: any,
  botToken: string,
  groupId: string
): Promise<boolean> {
  try {
    console.log(`[START-COMMAND] 🌟 Processing group start command with group ID: ${groupId}`);
    
    // First check if this is a UUID or a custom link
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(groupId);
    let resolvedGroupId = groupId;
    
    // If it's not a UUID, try to find by custom_link
    if (!isUUID) {
      console.log(`[START-COMMAND] 🔍 Group parameter is not a UUID, checking custom_link: ${groupId}`);
      const { data: groupData, error: linkError } = await supabase
        .from('community_groups')
        .select('id')
        .eq('custom_link', groupId)
        .single();
      
      if (linkError || !groupData) {
        console.log(`[START-COMMAND] ❌ No group found with custom_link: ${groupId}`);
        await sendTelegramMessage(
          botToken,
          message.chat.id,
          `Sorry, I couldn't find that group. 😕\n\nPlease check the link and try again.`,
          null  // No photo
        );
        
        await logUserInteraction(
          supabase,
          'start_command_invalid_group',
          message.from.id.toString(),
          message.from.username,
          message.text,
          {message, error: linkError?.message || 'No group found with this custom link'}
        );
        
        return true;
      }
      
      // Update groupId with the actual UUID
      resolvedGroupId = groupData.id;
      console.log(`[START-COMMAND] ✅ Found group with ID: ${resolvedGroupId} for custom_link: ${groupId}`);
    }
    
    // Get group details
    const { data: group, error: groupError } = await supabase
      .from('community_groups')
      .select('*')
      .eq('id', resolvedGroupId)
      .single();
    
    if (groupError || !group) {
      console.log(`[START-COMMAND] ❌ No group found with ID: ${resolvedGroupId}`);
      await sendTelegramMessage(
        botToken,
        message.chat.id,
        `Sorry, I couldn't find that group. 😕\n\nPlease check the link and try again.`,
        null  // No photo
      );
      
      await logUserInteraction(
        supabase,
        'start_command_invalid_group',
        message.from.id.toString(),
        message.from.username,
        message.text,
        {message, error: groupError?.message || `No group found with ID: ${resolvedGroupId}`}
      );
      
      return true;
    }
    
    // Get all communities in this group
    const { data: groupMembers, error: membersError } = await supabase
      .from('community_group_members')
      .select('community_id')
      .eq('group_id', group.id)
      .order('display_order', { ascending: true });
    
    if (membersError) {
      console.error(`[START-COMMAND] ❌ Error fetching group members:`, membersError);
      throw new Error(`Error fetching group members: ${membersError.message}`);
    }
    
    if (!groupMembers || groupMembers.length === 0) {
      console.log(`[START-COMMAND] ⚠️ Group has no communities: ${group.id}`);
      await sendTelegramMessage(
        botToken,
        message.chat.id,
        `The group "${group.name}" doesn't have any communities yet. Please contact the administrator.`,
        null  // No photo
      );
      
      await logUserInteraction(
        supabase,
        'start_command_empty_group',
        message.from.id.toString(),
        message.from.username,
        message.text,
        {message, group_id: group.id}
      );
      
      return true;
    }
    
    // Get community details for all communities in the group
    const communityIds = groupMembers.map(member => member.community_id);
    const { data: communities, error: communitiesError } = await supabase
      .from('communities')
      .select('id, name, description, telegram_photo_url, custom_link')
      .in('id', communityIds);
    
    if (communitiesError || !communities) {
      console.error(`[START-COMMAND] ❌ Error fetching communities:`, communitiesError);
      throw new Error(`Error fetching communities: ${communitiesError?.message}`);
    }
    
    // Construct welcome message for the group
    const miniAppUrl = "https://preview--subscribely-serenity.lovable.app/telegram-mini-app";
    const welcomeMessage = `Welcome to the "${group.name}" group! 🎉\n\n${group.description || ''}\n\nThis group includes the following communities:\n\n${communities.map(c => `• ${c.name}`).join('\n')}\n\nClick the button below to join these communities with a single subscription!`;
    
    // Add call-to-action button
    const inlineKeyboard = {
      inline_keyboard: [
        [
          {
            text: "Join Group 🚀",
            web_app: {
              url: `${miniAppUrl}?start=group_${group.id}`
            }
          }
        ]
      ]
    };
    
    // Use the first community's photo or the group's photo if available
    const welcomeImage = group.photo_url || 
      (communities.length > 0 ? communities[0].telegram_photo_url : null);
    
    console.log(`[START-COMMAND] 📤 Sending group welcome message with image: ${!!welcomeImage}`);
    console.log(`[START-COMMAND] 🔗 Mini app URL: ${miniAppUrl}?start=group_${group.id}`);
    
    // Send welcome message with photo if available
    await sendTelegramMessage(
      botToken,
      message.chat.id,
      welcomeMessage,
      welcomeImage,
      inlineKeyboard
    );
    
    // Log the interaction
    await logUserInteraction(
      supabase,
      'start_command_group',
      message.from.id.toString(),
      message.from.username,
      message.text,
      {message, group_id: group.id, communities: communities.map(c => c.id)}
    );
    
    return true;
  } catch (error) {
    console.error('[START-COMMAND] ❌ Error in handleGroupStartCommand:', error);
    
    try {
      // Log the error
      await supabase.from('telegram_errors').insert({
        error_type: 'group_start_command_error',
        error_message: error.message,
        stack_trace: error.stack,
        raw_data: message
      });
      
      // Send error message to the user
      await sendTelegramMessage(
        botToken,
        message.chat.id,
        `Sorry, something went wrong processing your group request. 😕\n\nPlease try again later.`,
        null  // No photo
      );
    } catch (logError) {
      console.error('[START-COMMAND] ❌ Error logging the group command error:', logError);
    }
    
    return false;
  }
}
