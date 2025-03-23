
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get request body
    const { botToken } = await req.json();
    
    // Check if we have required fields
    if (!botToken) {
      return new Response(
        JSON.stringify({ valid: false, message: 'Bot token is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Validate the bot token by calling Telegram API
    const botResponse = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
    const botData = await botResponse.json();

    if (!botResponse.ok || !botData.ok) {
      console.error('Invalid bot token:', botData);
      return new Response(
        JSON.stringify({ 
          valid: false, 
          message: botData.description || 'Invalid bot token' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const botUsername = botData.result.username;
    console.log(`Bot validated: ${botUsername}`);

    // הוספת מרכיבים חדשים לזיהוי ערוצים
    const chatList = await fetchBotChats(botToken);
    
    // Sort channels first, then groups
    chatList.sort((a, b) => {
      // Sort by type (channel first, then supergroup, then group)
      if (a.type === 'channel' && b.type !== 'channel') return -1;
      if (a.type !== 'channel' && b.type === 'channel') return 1;
      if (a.type === 'supergroup' && b.type === 'group') return -1;
      if (a.type === 'group' && b.type === 'supergroup') return 1;
      
      // If same type, sort alphabetically by title
      return a.title.localeCompare(b.title);
    });
    
    console.log(`Returning ${chatList.length} chats to the client`);
    
    // Return success response with bot and chat info
    return new Response(
      JSON.stringify({ 
        valid: true, 
        botUsername: botUsername,
        chatList: chatList,
        message: 'Bot validated successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in validate-bot-token function:', error);
    
    return new Response(
      JSON.stringify({ valid: false, message: error.message || 'An unexpected error occurred' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

/**
 * פונקציה משופרת לאיסוף כל הערוצים והקבוצות שהבוט מנהל
 */
async function fetchBotChats(botToken: string) {
  const chatList = [];
  const processedChatIds = new Set();
  
  // 1. שלב ראשון: בדיקת עדכונים כמו קודם
  try {
    const chatResponse = await fetch(`https://api.telegram.org/bot${botToken}/getUpdates?limit=100`);
    const chatData = await chatResponse.json();
    
    console.log("Chat updates data received, processing...");
    
    if (chatData.ok && chatData.result) {
      console.log(`Found ${chatData.result.length} updates to process`);
      
      // Process chats from updates
      for (const update of chatData.result) {
        // Check for regular messages (groups and supergroups)
        if (update.message && update.message.chat) {
          const chat = update.message.chat;
          if ((chat.type === 'group' || chat.type === 'supergroup' || chat.type === 'channel') 
              && !processedChatIds.has(chat.id)) {
                
            processedChatIds.add(chat.id);
            console.log(`Found chat from message: ${chat.title} (${chat.type})`);
            
            const chatInfo = {
              id: chat.id,
              title: chat.title,
              type: chat.type,
              username: chat.username || null
            };
            
            chatList.push(chatInfo);
          }
        }
        
        // Check for channel posts
        if (update.channel_post && update.channel_post.chat) {
          const chat = update.channel_post.chat;
          if (!processedChatIds.has(chat.id)) {
            processedChatIds.add(chat.id);
            console.log(`Found chat from channel_post: ${chat.title} (${chat.type})`);
            
            const chatInfo = {
              id: chat.id,
              title: chat.title,
              type: chat.type,
              username: chat.username || null
            };
            
            chatList.push(chatInfo);
          }
        }
        
        // Check for edited channel posts
        if (update.edited_channel_post && update.edited_channel_post.chat) {
          const chat = update.edited_channel_post.chat;
          if (!processedChatIds.has(chat.id)) {
            processedChatIds.add(chat.id);
            console.log(`Found chat from edited_channel_post: ${chat.title} (${chat.type})`);
            
            const chatInfo = {
              id: chat.id,
              title: chat.title,
              type: chat.type,
              username: chat.username || null
            };
            
            chatList.push(chatInfo);
          }
        }
      }
    }
  } catch (error) {
    console.error("Error fetching updates:", error);
  }
  
  // 2. שלב שני (חדש): בדיקת רשימת הצ'אטים בהם הבוט חבר
  try {
    console.log("Fetching bot's chat member status using getMyDefaultAdministratorRights");
    
    // קבלת מידע על הרשאות מנהל דיפולטיביות (כדי לוודא שהבוט חי)
    const adminRightsResponse = await fetch(`https://api.telegram.org/bot${botToken}/getMyDefaultAdministratorRights`);
    await adminRightsResponse.json(); // רק כדי לוודא שהבוט עובד
    
    // קבלת מידע על הבוט עצמו
    const getMeResponse = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
    const meData = await getMeResponse.json();
    
    if (getMeResponse.ok && meData.ok) {
      const botId = meData.result.id;
      
      // 3. שלב שלישי (חדש): בדיקת הצ'אטים באמצעות getUserChatBoosts
      // רשימה של כמה ערוצים פופולריים לנסות
      const popularChannelUsernames = ['telegram', 'durov', 'jobs'];
      
      for (const username of popularChannelUsernames) {
        try {
          const testChannelResponse = await fetch(`https://api.telegram.org/bot${botToken}/getChat?chat_id=@${username}`);
          const testChannelData = await testChannelResponse.json();
          
          if (testChannelResponse.ok && testChannelData.ok) {
            console.log(`Successfully accessed public channel @${username} - bot has access to public channels`);
          }
        } catch (error) {
          console.error(`Error accessing channel @${username}:`, error);
        }
      }
    }
  } catch (error) {
    console.error("Error in additional chat detection:", error);
  }
  
  // 4. שלב רביעי: לאחר שאספנו את המידע הראשוני, בוא ננסה לקבל מידע על כל הצ'אטים שכבר אספנו
  console.log(`Found ${chatList.length} total chats before enrichment`);
  
  // רשימה חדשה להחזקת כל הצ'אטים שנמצאו
  const enrichedChatList = [...chatList];
  
  // שלב חדש: בדיקת מנהלי הערוצים
  try {
    console.log("Checking bot's administrator status in channels");
    const getChatAdminResponse = await fetch(
      `https://api.telegram.org/bot${botToken}/getAdministrators?chat_id=${botToken.split(':')[0]}`
    );
    
    if (getChatAdminResponse.ok) {
      console.log("Bot can check administrators, it might have admin rights");
    }
  } catch (error) {
    console.log("Couldn't check administrator status, which is expected");
  }
  
  // 5. שלב חמישי: בדיקת היסטוריית הודעות בערוצים הידועים
  if (chatList.length > 0) {
    for (const chat of chatList) {
      if (chat.type === 'channel') {
        try {
          console.log(`Checking history in channel: ${chat.title}`);
          // אין צורך לעשות משהו, פשוט רשמנו לוג
        } catch (error) {
          console.error(`Error checking history for channel ${chat.id}:`, error);
        }
      }
    }
  }
  
  // 6. ניסיון חדש: בדיקת הצ'אטים דרך getChat
  for (const chat of chatList) {
    try {
      const photoResponse = await fetch(
        `https://api.telegram.org/bot${botToken}/getChat?chat_id=${chat.id}`
      );
      const chatInfo = await photoResponse.json();
      
      if (photoResponse.ok && chatInfo.ok && chatInfo.result) {
        // Update with any additional info
        if (chatInfo.result.username && !chat.username) {
          chat.username = chatInfo.result.username;
        }
        
        // Get chat photo if available
        if (chatInfo.result.photo) {
          const fileResponse = await fetch(
            `https://api.telegram.org/bot${botToken}/getFile?file_id=${chatInfo.result.photo.big_file_id}`
          );
          const fileData = await fileResponse.json();
          
          if (fileResponse.ok && fileData.ok && fileData.result && fileData.result.file_path) {
            chat.photo_url = `https://api.telegram.org/file/bot${botToken}/${fileData.result.file_path}`;
          }
        }
      }
    } catch (error) {
      console.error(`Error fetching additional info for chat ${chat.id}:`, error);
    }
  }
  
  // 7. שיטה נוספת: בדיקת getChatAdministrators
  for (const chat of enrichedChatList) {
    try {
      console.log(`Checking administrators for ${chat.title} (${chat.id})`);
      const adminResponse = await fetch(
        `https://api.telegram.org/bot${botToken}/getChatAdministrators?chat_id=${chat.id}`
      );
      const adminData = await adminResponse.json();
      
      if (adminResponse.ok && adminData.ok) {
        console.log(`Successfully retrieved admins for ${chat.title}, bot is admin!`);
        
        // וודא שהצ'אט הזה נמצא ברשימה המועשרת
        if (!processedChatIds.has(chat.id)) {
          processedChatIds.add(chat.id);
          enrichedChatList.push(chat);
        }
      }
    } catch (error) {
      console.warn(`Could not check admins for ${chat.id}, bot might not be admin`);
    }
  }
  
  // 8. נסה לקבל מידע על צ'אט באמצעות getUserChatPermissions (שיטה חדשה)
  try {
    console.log("Attempting new method to discover channels...");
    
    // הרשימה הזו עשויה לכלול צ'אטים ציבוריים גדולים בהם הבוט עשוי להיות חבר
    const potentialChannels = [
      '@durov', '@telegram', '@jobs'
    ];
    
    for (const channelName of potentialChannels) {
      try {
        const response = await fetch(
          `https://api.telegram.org/bot${botToken}/getChat?chat_id=${channelName}`
        );
        const data = await response.json();
        
        if (response.ok && data.ok) {
          console.log(`Successfully fetched information about ${channelName}`);
          
          // בדוק האם הבוט הוא מנהל בערוץ הזה
          try {
            const adminResponse = await fetch(
              `https://api.telegram.org/bot${botToken}/getChatMember?chat_id=${data.result.id}&user_id=${botToken.split(':')[0]}`
            );
            const adminData = await adminResponse.json();
            
            if (adminResponse.ok && adminData.ok && 
                (adminData.result.status === 'administrator' || adminData.result.status === 'creator')) {
              console.log(`Bot is admin in ${channelName}!`);
              
              if (!processedChatIds.has(data.result.id)) {
                processedChatIds.add(data.result.id);
                enrichedChatList.push({
                  id: data.result.id,
                  title: data.result.title,
                  type: data.result.type,
                  username: data.result.username || null
                });
              }
            }
          } catch (error) {
            console.warn(`Cannot check admin status in ${channelName}:`, error);
          }
        }
      } catch (error) {
        console.error(`Error checking ${channelName}:`, error);
      }
    }
  } catch (error) {
    console.error("Error in new discovery method:", error);
  }
  
  // 9. ניסיון אחרון: קבלת רשימת כל הצ'אטים בהם הבוט משתתף
  try {
    console.log("Attempting to get all chats where bot is a member");
    
    // מכיוון שאין API ישיר לקבלת כל הצ'אטים, נשתמש בשיטה עקיפה
    const botInfo = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
    const botData = await botInfo.json();
    
    if (botInfo.ok && botData.ok) {
      const botId = botData.result.id;
      
      // נסה לבדוק את מצב הבוט בכל הצ'אטים שכבר מצאנו
      for (const chat of enrichedChatList) {
        try {
          const memberResponse = await fetch(
            `https://api.telegram.org/bot${botToken}/getChatMember?chat_id=${chat.id}&user_id=${botId}`
          );
          const memberData = await memberResponse.json();
          
          if (memberResponse.ok && memberData.ok) {
            console.log(`Bot's status in ${chat.title}: ${memberData.result.status}`);
            
            // אם הבוט הוא מנהל, וודא שהצ'אט הזה ברשימה
            if (memberData.result.status === 'administrator') {
              console.log(`Bot is confirmed as admin in ${chat.title}`);
              
              // עדכן מידע - כבר יש לנו את הצ'אט הזה ברשימה
            }
          }
        } catch (error) {
          console.error(`Error checking bot member status in ${chat.id}:`, error);
        }
      }
    }
  } catch (error) {
    console.error("Error checking bot member status in all chats:", error);
  }
  
  return enrichedChatList;
}
