
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.1.0'

// Get environment variables
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const telegramBotToken = Deno.env.get('TELEGRAM_BOT_TOKEN')!;

// Initialize the Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

Deno.cron("check-subscriptions", "*/30 * * * *", async () => {
  console.log("[check-subscriptions] Starting subscription check...");
  
  try {
    const today = new Date();
    console.log(`[check-subscriptions] Current date: ${today.toISOString()}`);
    
    // Step 1: Query members with subscription end dates to check
    const { data: membersToCheck, error: membersError } = await supabase
      .from('get_members_to_check')
      .select(`
        member_id,
        community_id,
        telegram_user_id,
        subscription_end_date,
        is_active,
        subscription_status
      `);
      
    if (membersError) {
      console.error("[check-subscriptions] Error fetching members to check:", membersError);
      return;
    }
    
    console.log(`[check-subscriptions] Found ${membersToCheck?.length || 0} members to check`);
    
    // Group by community to retrieve settings once per community
    const communitiesWithMembers = membersToCheck?.reduce((acc, member) => {
      if (!acc[member.community_id]) {
        acc[member.community_id] = [];
      }
      acc[member.community_id].push(member);
      return acc;
    }, {} as Record<string, typeof membersToCheck>);
    
    for (const communityId in communitiesWithMembers) {
      if (!communitiesWithMembers[communityId]?.length) continue;
      
      // Get community details and bot settings
      const { data: community, error: communityError } = await supabase
        .from('communities')
        .select(`
          *,
          telegram_bot_settings (*)
        `)
        .eq('id', communityId)
        .single();
        
      if (communityError) {
        console.error(`[check-subscriptions] Error fetching community ${communityId}:`, communityError);
        continue;
      }
      
      const botSettings = community.telegram_bot_settings;
      const chatId = community.telegram_chat_id;
      
      console.log(`[check-subscriptions] Processing community: ${community.name} (${communityId})`);
      
      if (!botSettings || !chatId) {
        console.log(`[check-subscriptions] Missing bot settings or chat ID for community ${communityId}`);
        continue;
      }
      
      // Process each member in this community
      for (const member of communitiesWithMembers[communityId]) {
        try {
          // Get the bot URL for the specific community (for the "Renew Now!" button)
          const { data: botUrl } = await supabase
            .from('telegram_global_settings')
            .select('mini_app_url')
            .single();
          
          const miniAppUrl = botUrl?.mini_app_url || 'https://t.me/membifybot/app';
          const communityMiniAppUrl = `${miniAppUrl}?c=${communityId}`;
          
          // Check if member is active but subscription is expired
          if (member.is_active && !member.subscription_status) {
            console.log(`[check-subscriptions] Member ${member.telegram_user_id} is active but subscription is expired`);
            
            // Kick expired member logic would go here
            // ...
            continue;
          }
          
          // Skip if there's no subscription end date (lifetime member?)
          if (!member.subscription_end_date) {
            console.log(`[check-subscriptions] Member ${member.telegram_user_id} has no subscription end date`);
            continue;
          }
          
          const endDate = new Date(member.subscription_end_date);
          const daysUntilExpiration = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          console.log(`[check-subscriptions] Member ${member.telegram_user_id} has ${daysUntilExpiration} days until expiration`);
          
          // Check for different reminder days
          const firstReminderDays = botSettings.first_reminder_days || 3;
          const secondReminderDays = botSettings.second_reminder_days || 1;

          // Check for first reminder (earlier)
          if (daysUntilExpiration === firstReminderDays) {
            console.log(`[check-subscriptions] Sending first reminder to member ${member.telegram_user_id}`);
            
            await sendReminderMessage(
              telegramBotToken,
              member.telegram_user_id,
              botSettings.first_reminder_message || "Your subscription is expiring soon! Renew now to maintain access.",
              botSettings.bot_signature || "",
              botSettings.first_reminder_image || null,
              communityMiniAppUrl,
              "Renew Now!"
            );
            
            // Log the reminder
            await supabase.from('subscription_activity_logs').insert({
              community_id: communityId,
              telegram_user_id: member.telegram_user_id,
              activity_type: 'reminder_sent',
              details: `First reminder sent (${firstReminderDays} days before expiration)`
            });
          }
          // Check for second/final reminder (closer to expiration)
          else if (daysUntilExpiration === secondReminderDays) {
            console.log(`[check-subscriptions] Sending second/final reminder to member ${member.telegram_user_id}`);
            
            await sendReminderMessage(
              telegramBotToken,
              member.telegram_user_id,
              botSettings.second_reminder_message || "FINAL REMINDER: Your subscription is about to expire! Renew now to avoid losing access.",
              botSettings.bot_signature || "",
              botSettings.second_reminder_image || null,
              communityMiniAppUrl,
              "Renew Now!"
            );
            
            // Log the reminder
            await supabase.from('subscription_activity_logs').insert({
              community_id: communityId,
              telegram_user_id: member.telegram_user_id,
              activity_type: 'reminder_sent',
              details: `Final reminder sent (${secondReminderDays} days before expiration)`
            });
          }
          // Check for expired subscription
          else if (daysUntilExpiration <= 0 && member.subscription_status) {
            console.log(`[check-subscriptions] Subscription expired for member ${member.telegram_user_id}`);
            
            // Send expiration message
            await sendReminderMessage(
              telegramBotToken,
              member.telegram_user_id,
              botSettings.expired_subscription_message || "Your subscription has expired. You will lose access to the group.",
              botSettings.bot_signature || "",
              null,
              communityMiniAppUrl,
              "Renew Now!"
            );
            
            // Mark subscription as expired
            await supabase
              .from('telegram_chat_members')
              .update({ subscription_status: false })
              .eq('id', member.member_id);
              
            // Log the expiration
            await supabase.from('subscription_activity_logs').insert({
              community_id: communityId,
              telegram_user_id: member.telegram_user_id,
              activity_type: 'subscription_expired',
              details: 'Subscription expired and marked as inactive'
            });
          }
        } catch (memberError) {
          console.error(`[check-subscriptions] Error processing member ${member.telegram_user_id}:`, memberError);
        }
      }
    }
    
    console.log("[check-subscriptions] Subscription check completed successfully");
  } catch (error) {
    console.error("[check-subscriptions] Error in subscription check:", error);
  }
});

// Function to send reminder message with optional image and button
async function sendReminderMessage(
  botToken: string, 
  userId: string, 
  message: string, 
  signature: string, 
  imageUrl: string | null,
  buttonUrl: string,
  buttonText: string
) {
  try {
    const formattedMessage = `${message}\n\n${signature}`;
    
    // Prepare inline keyboard with the "Renew Now!" button
    const inlineKeyboard = {
      inline_keyboard: [
        [
          { 
            text: buttonText, 
            url: buttonUrl 
          }
        ]
      ]
    };
    
    // If image exists, send photo with caption
    if (imageUrl) {
      console.log(`[check-subscriptions] Sending photo message to user ${userId}`);
      
      // Handle base64 images
      if (imageUrl.startsWith('data:image')) {
        console.log(`[check-subscriptions] Base64 image detected, converting to multipart form...`);
        
        // Extract base64 data
        const base64Data = imageUrl.split(',')[1];
        
        // Determine image format from data URL
        const matches = imageUrl.match(/^data:image\/([a-zA-Z+]+);base64,/);
        const imageFormat = matches ? matches[1] : 'jpeg'; // Default to jpeg if format can't be determined
        
        // Create a FormData object
        const formData = new FormData();
        formData.append('chat_id', userId);
        
        // Convert Base64 string to Blob
        const byteCharacters = atob(base64Data);
        const byteArrays = [];
        
        for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
          const slice = byteCharacters.slice(offset, offset + 1024);
          
          const byteNumbers = new Array(slice.length);
          for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
          }
          
          const byteArray = new Uint8Array(byteNumbers);
          byteArrays.push(byteArray);
        }
        
        const blob = new Blob(byteArrays, { type: `image/${imageFormat}` });
        
        // Append the Blob as a file
        formData.append('photo', blob, `photo.${imageFormat}`);
        
        formData.append('caption', formattedMessage);
        formData.append('parse_mode', 'HTML');
        formData.append('reply_markup', JSON.stringify(inlineKeyboard));
        
        // Send the request with FormData
        const response = await fetch(
          `https://api.telegram.org/bot${botToken}/sendPhoto`,
          {
            method: 'POST',
            body: formData
          }
        );
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error(`[check-subscriptions] Error sending photo message:`, errorData);
          
          // Fallback to text message if photo fails
          await sendTextMessage(botToken, userId, formattedMessage, inlineKeyboard);
        }
      } else {
        // For regular URLs, use JSON approach
        const response = await fetch(
          `https://api.telegram.org/bot${botToken}/sendPhoto`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: userId,
              photo: imageUrl,
              caption: formattedMessage,
              parse_mode: 'HTML',
              reply_markup: inlineKeyboard
            })
          }
        );
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error(`[check-subscriptions] Error sending photo message:`, errorData);
          
          // Fallback to text message if photo fails
          await sendTextMessage(botToken, userId, formattedMessage, inlineKeyboard);
        }
      }
    } else {
      // If no image, send text message
      await sendTextMessage(botToken, userId, formattedMessage, inlineKeyboard);
    }
    
    return true;
  } catch (error) {
    console.error(`[check-subscriptions] Error sending reminder message to ${userId}:`, error);
    return false;
  }
}

// Helper function to send text message
async function sendTextMessage(
  botToken: string, 
  userId: string, 
  message: string, 
  inlineKeyboard: any
) {
  try {
    console.log(`[check-subscriptions] Sending text message to user ${userId}`);
    
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: userId,
          text: message,
          parse_mode: 'HTML',
          reply_markup: inlineKeyboard
        })
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error(`[check-subscriptions] Error sending text message:`, errorData);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`[check-subscriptions] Error sending text message to ${userId}:`, error);
    return false;
  }
}
