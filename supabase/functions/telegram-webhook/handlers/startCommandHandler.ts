
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { sendTelegramMessage } from '../utils/telegramMessenger.ts';
import { handleSubscription } from '../subscriptionHandler.ts';
import { createOrUpdateMember } from '../utils/dbLogger.ts';
import { logUserInteraction } from '../utils/logHelper.ts';
import { updateCommunityMemberCount } from '../utils/communityCountUtils.ts';
import { createInviteLink, createGroupInviteLink } from './inviteLinkHandler.ts';

/**
 * Handle the /start command from a Telegram user
 */
export async function handleStartCommand(
  supabase: ReturnType<typeof createClient>,
  message: any,
  botToken: string
): Promise<boolean> {
  try {
    console.log("🚀 [START-COMMAND] Handling /start command");
    
    // Check if this is a response to the start command
    if (!message?.text || !message.text.startsWith('/start')) {
      console.log("⏭️ [START-COMMAND] Not a start command, skipping");
      return false;
    }
    
    const userId = message.from.id.toString();
    const username = message.from.username;
    
    console.log(`👤 [START-COMMAND] User ID: ${userId}, Username: ${username || 'none'}`);
    
    // Log the interaction
    await logUserInteraction(
      supabase,
      'start_command',
      userId,
      username,
      'User sent /start command',
      { message_text: message.text }
    );
    
    // Parse start parameters if any
    const startParams = message.text.split(' ');
    const startParam = startParams.length > 1 ? startParams[1] : null;
    
    console.log(`🔍 [START-COMMAND] Start parameter: ${startParam || 'none'}`);
    
    // Check if the user has provided an invite link parameter
    if (startParam) {
      if (startParam.startsWith('group_')) {
        // This is a group code
        const groupId = startParam.substring(6);
        console.log(`👥👥👥 [START-COMMAND] Group parameter detected: ${groupId}`);
        return await handleGroupStartCommand(supabase, message, botToken, groupId);
      } else {
        // This is likely a community code
        console.log(`🏢 [START-COMMAND] Community parameter detected: ${startParam}`);
        return await handleCommunityStartCommand(supabase, message, botToken, startParam);
      }
    } else {
      // No parameter provided, send general welcome message
      console.log("👋 [START-COMMAND] No parameter, sending general welcome message");
      
      const welcomeMessage = `👋 Welcome to Membify! This bot helps you manage paid memberships for your Telegram groups.`;
      
      await sendTelegramMessage(botToken, message.chat.id, welcomeMessage);
      
      return true;
    }
  } catch (error) {
    console.error("❌ [START-COMMAND] Error handling start command:", error);
    
    // Log the error
    await supabase.from('telegram_errors').insert({
      error_type: 'start_command_error',
      error_message: error.message,
      stack_trace: error.stack,
      raw_data: message
    });
    
    return false;
  }
}

/**
 * Handle start command for community invites
 */
async function handleCommunityStartCommand(
  supabase: ReturnType<typeof createClient>, 
  message: any, 
  botToken: string,
  communityId: string
): Promise<boolean> {
  try {
    console.log(`🏢 [START-COMMAND] Processing community start command for community ID: ${communityId}`);
    
    const userId = message.from.id.toString();
    const username = message.from.username;
    
    // Check if community exists
    const { data: community, error: communityError } = await supabase
      .from('communities')
      .select('id, name, telegram_chat_id')
      .eq('id', communityId)
      .single();
    
    if (communityError || !community) {
      console.error(`❌ [START-COMMAND] Community not found: ${communityError?.message || 'Unknown error'}`);
      
      await sendTelegramMessage(
        botToken,
        message.chat.id,
        `❌ Sorry, the community you're trying to join doesn't exist or there was an error.`
      );
      
      return true;
    }
    
    console.log(`✅ [START-COMMAND] Found community: ${community.name} (${community.id})`);
    
    // Check for an active subscription
    const { data: subscriptionInfo } = await handleSubscription(supabase, communityId);
    
    if (subscriptionInfo) {
      console.log(`💰 [START-COMMAND] Found active subscription: Plan ID ${subscriptionInfo.subscriptionPlanId}`);
      
      // Create/update member record
      const memberData = {
        telegram_user_id: userId,
        telegram_username: username,
        community_id: community.id,
        is_active: true,
        subscription_status: 'active',
        subscription_plan_id: subscriptionInfo.subscriptionPlanId,
        subscription_start_date: subscriptionInfo.subscriptionStartDate.toISOString(),
        subscription_end_date: subscriptionInfo.subscriptionEndDate.toISOString()
      };
      
      console.log(`👤 [START-COMMAND] Creating/updating member record with data:`, JSON.stringify(memberData, null, 2));
      
      const { success, id } = await createOrUpdateMember(supabase, memberData);
      
      if (!success) {
        console.error("❌ [START-COMMAND] Failed to create/update member record");
        
        await sendTelegramMessage(
          botToken,
          message.chat.id,
          `❌ Sorry, there was an error processing your subscription.`
        );
        
        return true;
      }
      
      console.log(`✅ [START-COMMAND] Member record created/updated with ID: ${id}`);
      
      // Create a personalized invite link
      console.log(`🔗 [START-COMMAND] Creating personalized invite link for community: ${community.id}`);
      
      try {
        const inviteLinkResult = await createInviteLink(supabase, community.id, botToken, {
          name: `User ${userId} - ${new Date().toISOString().split('T')[0]}`,
          expireHours: 24
        });
        
        if (inviteLinkResult?.invite_link) {
          console.log(`🔗 [START-COMMAND] Created invite link: ${inviteLinkResult.invite_link}`);
          
          // Update the payment record with the invite link
          const { error: updateError } = await supabase
            .from('subscription_payments')
            .update({ invite_link: inviteLinkResult.invite_link })
            .eq('telegram_user_id', userId)
            .eq('community_id', community.id)
            .eq('status', 'completed')
            .order('created_at', { ascending: false })
            .limit(1);
          
          if (updateError) {
            console.error(`❌ [START-COMMAND] Failed to update payment with invite link: ${updateError.message}`);
          }
          
          // Send welcome message with invite link
          await sendTelegramMessage(
            botToken,
            message.chat.id,
            `✅ Thanks for subscribing to ${community.name}!\n\n` +
            `Here's your invite link to join the community:\n${inviteLinkResult.invite_link}\n\n` +
            `This link will expire in 24 hours and is for your use only. Please don't share it with others.`
          );
          
          // Update community member count
          await updateCommunityMemberCount(supabase, community.id);
          
          return true;
        } else {
          console.error("❌ [START-COMMAND] Failed to create invite link - empty result");
        }
      } catch (linkError) {
        console.error("❌ [START-COMMAND] Error creating invite link:", linkError);
      }
      
      // If we reach here, something went wrong with the invite link creation
      await sendTelegramMessage(
        botToken,
        message.chat.id,
        `✅ Thanks for subscribing to ${community.name}!\n\n` +
        `However, there was an issue creating your invite link. Please contact the community owner for assistance.`
      );
      
      return true;
    } else {
      console.log(`❌ [START-COMMAND] No active subscription found for user ${userId} in community ${community.id}`);
      
      // No active subscription
      await sendTelegramMessage(
        botToken,
        message.chat.id,
        `👋 Welcome! To join ${community.name}, you need an active subscription.\n\n` +
        `Please visit our mini app to purchase a subscription.`
      );
      
      return true;
    }
  } catch (error) {
    console.error("❌ [START-COMMAND] Error in handleCommunityStartCommand:", error);
    return false;
  }
}

/**
 * Handle start command for group invites
 */
async function handleGroupStartCommand(
  supabase: ReturnType<typeof createClient>, 
  message: any, 
  botToken: string,
  groupId: string
): Promise<boolean> {
  try {
    console.log(`👥👥👥 [START-COMMAND] Processing GROUP start command for group ID: ${groupId}`);
    
    const userId = message.from.id.toString();
    const username = message.from.username;
    
    // Check if group exists
    const { data: group, error: groupError } = await supabase
      .from('community_groups')
      .select('id, name, community_id, telegram_chat_id')
      .eq('id', groupId)
      .single();
    
    if (groupError || !group) {
      console.error(`❌ [START-COMMAND] Group not found: ${groupError?.message || 'Unknown error'}`);
      
      await sendTelegramMessage(
        botToken,
        message.chat.id,
        `❌ Sorry, the group you're trying to join doesn't exist or there was an error.`
      );
      
      return true;
    }
    
    console.log(`✅ [START-COMMAND] Found group: ${group.name} (${group.id}) from community ${group.community_id}`);
    
    // Get community info
    const { data: community, error: communityError } = await supabase
      .from('communities')
      .select('id, name')
      .eq('id', group.community_id)
      .single();
      
    if (communityError) {
      console.error(`❌ [START-COMMAND] Error fetching community for group: ${communityError.message}`);
    }
    
    // Check if user has an active subscription for the parent community
    const { data: memberships, error: membershipError } = await supabase
      .from('telegram_chat_members')
      .select('id, subscription_status, subscription_end_date')
      .eq('telegram_user_id', userId)
      .eq('community_id', group.community_id);
      
    if (membershipError) {
      console.error(`❌ [START-COMMAND] Error checking membership: ${membershipError.message}`);
    }
    
    const activeMembership = memberships?.find(m => 
      m.subscription_status === 'active' || 
      (m.subscription_status === true) || 
      (m.subscription_end_date && new Date(m.subscription_end_date) > new Date())
    );
    
    if (activeMembership) {
      console.log(`💰 [START-COMMAND] Found active membership for group's community: ${activeMembership.id}`);
      
      // Create a personalized group invite link
      console.log(`🔗 [START-COMMAND] Creating personalized GROUP invite link for group: ${group.id}`);
      
      try {
        const inviteLinkResult = await createGroupInviteLink(supabase, group.id, botToken, {
          name: `User ${userId} - ${new Date().toISOString().split('T')[0]}`,
          expireHours: 24
        });
        
        if (inviteLinkResult?.invite_link) {
          console.log(`🔗 [START-COMMAND] Created GROUP invite link: ${inviteLinkResult.invite_link}`);
          
          // Send welcome message with invite link
          await sendTelegramMessage(
            botToken,
            message.chat.id,
            `✅ Thanks for your interest in ${group.name}${community ? ` from ${community.name}` : ''}!\n\n` +
            `Here's your invite link to join the group:\n${inviteLinkResult.invite_link}\n\n` +
            `This link will expire in 24 hours and is for your use only. Please don't share it with others.`
          );
          
          return true;
        } else {
          console.error("❌ [START-COMMAND] Failed to create GROUP invite link - empty result");
        }
      } catch (linkError) {
        console.error("❌ [START-COMMAND] Error creating GROUP invite link:", linkError);
      }
      
      // If we reach here, something went wrong with the invite link creation
      await sendTelegramMessage(
        botToken,
        message.chat.id,
        `✅ Thanks for your interest in ${group.name}!\n\n` +
        `However, there was an issue creating your invite link. Please contact the community owner for assistance.`
      );
      
      return true;
    } else {
      console.log(`❌ [START-COMMAND] No active membership found for user ${userId} in community ${group.community_id}`);
      
      // No active subscription
      const communityName = community?.name || "this community";
      
      await sendTelegramMessage(
        botToken,
        message.chat.id,
        `👋 Welcome! To join ${group.name}, you need an active subscription to ${communityName}.\n\n` +
        `Please subscribe to the main community first before trying to join this group.`
      );
      
      return true;
    }
  } catch (error) {
    console.error("❌ [START-COMMAND] Error in handleGroupStartCommand:", error);
    return false;
  }
}
