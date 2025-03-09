import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BroadcastStatus {
  successCount: number;
  failureCount: number;
  totalRecipients: number;
}

export const useBroadcast = (communityId: string) => {
  return useMutation({
    mutationFn: async ({ 
      message, 
      filterType,
      subscriptionPlanId,
      includeButton,
      image
    }: { 
      message: string; 
      filterType: 'all' | 'active' | 'expired' | 'plan';
      subscriptionPlanId?: string;
      includeButton?: boolean;
      image?: string | null;
    }): Promise<BroadcastStatus> => {
      if (!communityId) {
        throw new Error('Community ID is required');
      }

      console.log('Starting broadcast with params:', {
        filterType,
        subscriptionPlanId,
        includeButton,
        hasImage: !!image,
        communityId
      });

      const { data: community, error: communityError } = await supabase
        .from('communities')
        .select('miniapp_url')
        .eq('id', communityId)
        .single();

      if (communityError) {
        console.error('Error fetching community:', communityError);
      }

      let miniAppUrl = community?.miniapp_url || "https://preview--subscribely-serenity.lovable.app/telegram-mini-app";
      
      if (!community?.miniapp_url) {
        const { error: updateError } = await supabase
          .from('communities')
          .update({ miniapp_url: miniAppUrl })
          .eq('id', communityId);
          
        if (updateError) {
          console.error('Error updating community miniapp_url:', updateError);
        } else {
          console.log('Updated community with default miniapp_url');
        }
      }

      let query = supabase
        .from('telegram_chat_members')
        .select('*')
        .eq('community_id', communityId)
        .eq('is_active', true);

      switch (filterType) {
        case 'active':
          query = query.eq('subscription_status', true);
          break;
        case 'expired':
          query = query.eq('subscription_status', false)
            .not('subscription_end_date', 'is', null);
          break;
        case 'plan':
          if (subscriptionPlanId) {
            query = query.eq('subscription_plan_id', subscriptionPlanId);
          }
          break;
      }

      const { data: activeMembers, error: membersError } = await query;

      if (membersError) {
        console.error('Error fetching members:', membersError);
        throw membersError;
      }

      console.log('Filtered members found:', {
        totalActive: activeMembers?.length || 0,
        filterType,
        subscriptionPlanId,
      });

      if (!activeMembers || activeMembers.length === 0) {
        return {
          successCount: 0,
          failureCount: 0,
          totalRecipients: 0
        };
      }

      const { data: settings, error: settingsError } = await supabase
        .from('telegram_global_settings')
        .select('bot_token')
        .single();

      if (settingsError || !settings?.bot_token) {
        console.error('Error fetching bot token:', settingsError);
        throw new Error('Bot token not found');
      }

      let messageOptions: any = {
        parse_mode: 'HTML'
      };

      if (includeButton) {
        messageOptions.reply_markup = {
          inline_keyboard: [[
            {
              text: "Join Community🚀",
              web_app: { url: `${miniAppUrl}?start=${communityId}` }
            }
          ]]
        };
        
        console.log('Including button with URL:', `${miniAppUrl}?start=${communityId}`);
      }

      let successCount = 0;
      let failureCount = 0;

      for (const member of activeMembers) {
        try {
          if (!member.telegram_user_id) {
            console.error('Member has no telegram_user_id:', member);
            failureCount++;
            continue;
          }

          if (image) {
            console.log(`Sending image message to ${member.telegram_username || member.telegram_user_id}`);
            
            if (image.startsWith('data:')) {
              try {
                const response = await fetch(image);
                const blob = await response.blob();
                
                const formData = new FormData();
                formData.append('chat_id', member.telegram_user_id);
                formData.append('caption', message);
                
                formData.append('parse_mode', 'HTML');
                if (includeButton) {
                  formData.append('reply_markup', JSON.stringify(messageOptions.reply_markup));
                }
                
                formData.append('photo', blob, 'image.jpg');
                
                const sendResponse = await fetch(`https://api.telegram.org/bot${settings.bot_token}/sendPhoto`, {
                  method: 'POST',
                  body: formData,
                });

                const result = await sendResponse.json();
                console.log(`Image message sent to ${member.telegram_username || member.telegram_user_id}:`, result.ok);

                if (result.ok) {
                  successCount++;
                } else {
                  console.error(`Failed to send image message:`, result);
                  failureCount++;
                  
                  try {
                    const textResponse = await fetch(`https://api.telegram.org/bot${settings.bot_token}/sendMessage`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        chat_id: member.telegram_user_id,
                        text: message,
                        ...messageOptions
                      }),
                    });
                    
                    const textResult = await textResponse.json();
                    if (textResult.ok) {
                      console.log(`Fallback text message sent successfully`);
                      successCount++;
                      failureCount--;
                    }
                  } catch (fallbackError) {
                    console.error(`Fallback also failed:`, fallbackError);
                  }
                }
              } catch (error) {
                console.error("Error processing data URL:", error);
                failureCount++;
                
                try {
                  const textResponse = await fetch(`https://api.telegram.org/bot${settings.bot_token}/sendMessage`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      chat_id: member.telegram_user_id,
                      text: message,
                      ...messageOptions
                    }),
                  });
                  
                  const textResult = await textResponse.json();
                  if (textResult.ok) {
                    console.log(`Fallback text message sent successfully`);
                    successCount++;
                    failureCount--;
                  }
                } catch (fallbackError) {
                  console.error(`Fallback also failed:`, fallbackError);
                }
              }
            } else {
              const response = await fetch(`https://api.telegram.org/bot${settings.bot_token}/sendPhoto`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  chat_id: member.telegram_user_id,
                  photo: image,
                  caption: message,
                  ...messageOptions
                }),
              });

              const result = await response.json();
              console.log(`Image message sent to ${member.telegram_username || member.telegram_user_id}:`, result.ok);

              if (result.ok) {
                successCount++;
              } else {
                console.error(`Failed to send message:`, result);
                failureCount++;
              }
            }
          } else {
            console.log(`Sending text message to ${member.telegram_username || member.telegram_user_id}`);
            const response = await fetch(`https://api.telegram.org/bot${settings.bot_token}/sendMessage`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                chat_id: member.telegram_user_id,
                text: message,
                ...messageOptions
              }),
            });

            const result = await response.json();
            console.log(`Message sent to ${member.telegram_username || member.telegram_user_id}:`, result.ok);

            if (result.ok) {
              successCount++;
            } else {
              console.error(`Failed to send message:`, result);
              failureCount++;
            }
          }

          await new Promise(resolve => setTimeout(resolve, 35));
        } catch (error) {
          console.error(`Error sending message to ${member.telegram_username || member.telegram_user_id}:`, error);
          failureCount++;
        }
      }

      const status: BroadcastStatus = {
        successCount,
        failureCount,
        totalRecipients: activeMembers.length
      };

      if (status.successCount === 0 && status.totalRecipients > 0) {
        throw new Error('Failed to send message to any users');
      }

      console.log('Broadcast completed with status:', status);
      return status;
    },
    onSuccess: (data) => {
      if (data.totalRecipients === 0) {
        toast.warning('No active users found to send the message');
      } else {
        toast.success(
          `Message sent successfully to ${data.successCount} out of ${data.totalRecipients} users`
        );
      }
    },
    onError: (error) => {
      console.error('Error sending broadcast:', error);
      toast.error(error instanceof Error ? error.message : 'Error sending messages');
    }
  });
};
