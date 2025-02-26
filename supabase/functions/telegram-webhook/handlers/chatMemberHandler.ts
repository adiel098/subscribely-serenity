
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export const handleChatMember = async (update: any, supabase: ReturnType<typeof createClient>) => {
  console.log('Processing chat member update:', update);

  const chatMember = update.chat_member || update.my_chat_member;
  if (!chatMember) {
    console.log('No chat member data found in update');
    return new Response(JSON.stringify({ error: 'No chat member data' }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400 
    });
  }

  try {
    // Get community ID from the chat ID
    console.log('Fetching community for chat:', chatMember.chat.id);
    const { data: community, error: communityError } = await supabase
      .from('communities')
      .select('id')
      .eq('telegram_chat_id', chatMember.chat.id.toString())
      .single();

    if (communityError || !community) {
      console.error('Error finding community:', communityError);
      return new Response(JSON.stringify({ error: 'Community not found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404
      });
    }

    console.log('Found community:', community.id);

    // If user joins the chat (status changes to 'member', 'administrator', or 'creator')
    if (['member', 'administrator', 'creator'].includes(chatMember.new_chat_member?.status)) {
      console.log('User joined chat:', {
        userId: chatMember.new_chat_member.user.id,
        status: chatMember.new_chat_member.status
      });

      // Update member status to active
      const { error: updateError } = await supabase
        .from('telegram_chat_members')
        .update({ 
          is_active: true,
          last_active: new Date().toISOString()
        })
        .eq('community_id', community.id)
        .eq('telegram_user_id', chatMember.new_chat_member.user.id.toString());

      if (updateError) {
        console.error('Error updating member status:', updateError);
        return new Response(JSON.stringify({ error: 'Failed to update member status' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        });
      }

      console.log('Successfully updated member status to active');
    }
    // If user leaves chat or is removed
    else if (chatMember.old_chat_member?.status === 'member' && 
             chatMember.new_chat_member?.status === 'left') {
      console.log('User left chat:', chatMember.new_chat_member.user.id);

      const { error: updateError } = await supabase
        .from('telegram_chat_members')
        .update({ 
          is_active: false,
          last_active: new Date().toISOString()
        })
        .eq('community_id', community.id)
        .eq('telegram_user_id', chatMember.new_chat_member.user.id.toString());

      if (updateError) {
        console.error('Error updating member status:', updateError);
        return new Response(JSON.stringify({ error: 'Failed to update member status' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        });
      }

      console.log('Successfully updated member status to inactive');
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Error in chat member handler:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
};

