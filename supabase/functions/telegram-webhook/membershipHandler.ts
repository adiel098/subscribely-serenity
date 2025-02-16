import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { ChatMemberUpdate } from './types.ts';
import { logTelegramEvent } from './eventLogger.ts';

export async function handleChatMemberUpdate(supabase: ReturnType<typeof createClient>, update: { chat_member: ChatMemberUpdate }) {
  try {
    console.log('👥 Processing chat_member update:', JSON.stringify(update.chat_member, null, 2));
    
    const chatMember = update.chat_member;
    const { chat, from: member, new_chat_member, old_chat_member, invite_link } = chatMember;
    
    if (new_chat_member?.status === 'member' && old_chat_member?.status === 'left') {
      console.log('🎉 Member joined channel:', member.username);
      
      const { data: community, error: communityError } = await supabase
        .from('communities')
        .select('id')
        .eq('telegram_chat_id', chat.id.toString())
        .single();
        
      if (communityError) {
        console.error('Error finding community:', communityError);
        throw communityError;
      }
      
      if (!community) {
        console.error('Community not found for chat_id:', chat.id);
        throw new Error(`Community not found for chat_id: ${chat.id}`);
      }
      
      console.log('Found community:', community);
      
      const { data: payment, error: paymentError } = await supabase
        .from('subscription_payments')
        .select(`
          id,
          plan_id,
          subscription_plans:plan_id (
            interval
          )
        `)
        .eq('invite_link', invite_link?.invite_link)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .maybeSingle();

      if (paymentError) {
        console.error('Error checking payment:', paymentError);
        throw paymentError;
      }

      let subscriptionStartDate = new Date();
      let subscriptionEndDate = null;
      let subscriptionPlanId = null;

      if (payment) {
        console.log('Found payment:', payment);
        subscriptionPlanId = payment.plan_id;
        
        if (payment.subscription_plans?.interval) {
          switch (payment.subscription_plans.interval) {
            case 'monthly':
              subscriptionEndDate = new Date(subscriptionStartDate);
              subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);
              break;
            case 'quarterly':
              subscriptionEndDate = new Date(subscriptionStartDate);
              subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 3);
              break;
            case 'half-yearly':
              subscriptionEndDate = new Date(subscriptionStartDate);
              subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 6);
              break;
            case 'yearly':
              subscriptionEndDate = new Date(subscriptionStartDate);
              subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1);
              break;
            case 'one-time':
              subscriptionEndDate = new Date(subscriptionStartDate);
              subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 100);
              break;
          }
        }
      }
      
      const { data: existingMember, error: memberCheckError } = await supabase
        .from('telegram_chat_members')
        .select('id')
        .eq('community_id', community.id)
        .eq('telegram_user_id', member.id.toString())
        .maybeSingle();
        
      if (memberCheckError) {
        console.error('Error checking existing member:', memberCheckError);
        throw memberCheckError;
      }
      
      const memberData = {
        telegram_username: member.username,
        is_active: true,
        last_active: new Date().toISOString(),
        subscription_status: Boolean(payment),
        subscription_plan_id: subscriptionPlanId,
        subscription_start_date: subscriptionStartDate.toISOString(),
        subscription_end_date: subscriptionEndDate?.toISOString() || null
      };
      
      if (existingMember) {
        console.log('Member already exists, updating with:', memberData);
        const { error: updateError } = await supabase
          .from('telegram_chat_members')
          .update(memberData)
          .eq('id', existingMember.id);
          
        if (updateError) {
          console.error('Error updating member:', updateError);
          throw updateError;
        }
      } else {
        console.log('Creating new member with:', memberData);
        const { error: insertError } = await supabase
          .from('telegram_chat_members')
          .insert([{
            community_id: community.id,
            telegram_user_id: member.id.toString(),
            joined_at: new Date().toISOString(),
            ...memberData
          }]);
          
        if (insertError) {
          console.error('Error inserting member:', insertError);
          throw insertError;
        }
      }
      
      console.log('✅ Successfully processed new member');
    } else if (new_chat_member?.status === 'left' && old_chat_member?.status === 'member') {
      console.log('👋 Member left channel:', member.username);
      
      const { data: community, error: communityError } = await supabase
        .from('communities')
        .select('id')
        .eq('telegram_chat_id', chat.id.toString())
        .single();
        
      if (communityError) {
        console.error('Error finding community:', communityError);
        throw communityError;
      }
      
      if (!community) {
        console.error('Community not found for chat_id:', chat.id);
        throw new Error(`Community not found for chat_id: ${chat.id}`);
      }
      
      const { error: updateError } = await supabase
        .from('telegram_chat_members')
        .update({
          is_active: false,
          subscription_status: false,
          subscription_end_date: new Date().toISOString()
        })
        .eq('community_id', community.id)
        .eq('telegram_user_id', member.id.toString());
        
      if (updateError) {
        console.error('Error updating member status:', updateError);
        throw updateError;
      }
      
      console.log('✅ Successfully processed member departure');
    }
    
    await logTelegramEvent(supabase, 'chat_member', update);
  } catch (error) {
    console.error('Error in handleChatMemberUpdate:', error);
    throw error;
  }
}

export async function handleChatJoinRequest(supabase: ReturnType<typeof createClient>, update: any) {
  try {
    console.log('👤 Processing chat join request:', JSON.stringify(update.chat_join_request, null, 2));
    await logTelegramEvent(supabase, 'chat_join_request', update);
  } catch (error) {
    console.error('Error in handleChatJoinRequest:', error);
    throw error;
  }
}

export async function handleNewMessage(supabase: ReturnType<typeof createClient>, update: any, context: { BOT_TOKEN: string }) {
  try {
    console.log('🗨️ Processing new message:', JSON.stringify(update.message, null, 2));
    
    const message = update.message;
    if (message?.text?.startsWith('/start')) {
      console.log('Processing /start command');
      const communityId = message.text.split(' ')[1];
      
      if (communityId) {
        console.log(`Looking up community with ID: ${communityId}`);
        const { data: community, error: communityError } = await supabase
          .from('communities')
          .select('*')
          .eq('id', communityId)
          .single();

        if (communityError || !community) {
          console.error('Error finding community:', communityError);
          return;
        }

        console.log('Found community:', community);
        const miniAppUrl = `https://trkiniaqliiwdkrvvuky.supabase.co/functions/v1/telegram-mini-app`;

        // שליחת הודעה עם כפתור למיני אפ
        const response = await fetch(`https://api.telegram.org/bot${context.BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: message.chat.id,
            text: `ברוכים הבאים ל-${community.name}! 🎉\nלחצו על הכפתור למטה כדי להצטרף:`,
            reply_markup: {
              inline_keyboard: [[
                {
                  text: "הצטרפות לקהילה 🚀",
                  web_app: {
                    url: `${miniAppUrl}?start=${communityId}`
                  }
                }
              ]]
            }
          })
        });

        const result = await response.json();
        console.log('Telegram API response:', result);
      }
    }
    
    await logTelegramEvent(supabase, 'new_message', update);
  } catch (error) {
    console.error('Error in handleNewMessage:', error);
    throw error;
  }
}

export async function handleEditedMessage(supabase: ReturnType<typeof createClient>, update: any) {
  try {
    console.log('✏️ Processing edited message:', JSON.stringify(update.edited_message, null, 2));
    await logTelegramEvent(supabase, 'edited_message', update);
  } catch (error) {
    console.error('Error in handleEditedMessage:', error);
    throw error;
  }
}

export async function handleChannelPost(supabase: ReturnType<typeof createClient>, update: any) {
  try {
    console.log('📢 Processing channel post:', JSON.stringify(update.channel_post, null, 2));
    await logTelegramEvent(supabase, 'channel_post', update);
  } catch (error) {
    console.error('Error in handleChannelPost:', error);
    throw error;
  }
}

export async function handleMyChatMember(supabase: ReturnType<typeof createClient>, update: any) {
  try {
    console.log('👥 Processing my_chat_member update:', JSON.stringify(update.my_chat_member, null, 2));
    
    const chatMember = update.my_chat_member;
    if (chatMember.new_chat_member?.status === 'member' || 
        chatMember.new_chat_member?.status === 'administrator') {
      console.log('🎉 New channel membership detected!');
    }
    
    await logTelegramEvent(supabase, 'my_chat_member', update);
  } catch (error) {
    console.error('Error in handleMyChatMember:', error);
    throw error;
  }
}
