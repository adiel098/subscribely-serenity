
/**
 * Specialized class for detecting Telegram channels and groups where the bot is an admin
 */
export class TelegramChannelDetector {
  private botToken: string;
  private botId: string | null = null;

  constructor(botToken: string) {
    this.botToken = botToken;
    // Extract bot ID from token (first part before the colon)
    const tokenParts = botToken.split(':');
    if (tokenParts.length > 1) {
      this.botId = tokenParts[0];
    }
  }

  /**
   * Validates the bot token by calling Telegram API
   * @returns Object with validation result
   */
  async validateBotToken(): Promise<{ valid: boolean; username?: string; message?: string }> {
    try {
      console.log("Validating bot token...");
      const botResponse = await fetch(`https://api.telegram.org/bot${this.botToken}/getMe`);
      const botData = await botResponse.json();

      if (!botResponse.ok || !botData.ok) {
        console.error('Invalid bot token:', botData);
        return { 
          valid: false, 
          message: botData.description || 'Invalid bot token' 
        };
      }

      this.botId = botData.result.id.toString();
      const botUsername = botData.result.username;
      console.log(`Bot validated: ${botUsername} (ID: ${this.botId})`);
      
      return {
        valid: true,
        username: botUsername
      };
    } catch (error) {
      console.error("Error validating bot token:", error);
      return {
        valid: false,
        message: error.message || 'Error validating bot token'
      };
    }
  }

  /**
   * Main method to detect all chats (channels and groups) where the bot is an admin
   * @returns Array of chats with their details
   */
  async detectBotChats() {
    console.log("Starting comprehensive channel and group detection...");
    
    // Store all detected chats here (using Set to avoid duplicates)
    const chatMap = new Map();
    
    // Step 1: Check updates with focus on my_chat_member events
    await this.detectChatsFromUpdates(chatMap);
    
    // Step 2: Try to get chat administrators for known chats
    await this.verifyBotAdminStatus(chatMap);
    
    // Step 3: Try direct channel access with popular channels as a fallback
    await this.detectPopularChannels(chatMap);
    
    // Convert the Map to an array and sort it properly
    const chatList = Array.from(chatMap.values());
    
    // Sort: channels first, then supergroups, then groups
    chatList.sort((a, b) => {
      // Sort by type (channel first, then supergroup, then group)
      if (a.type === 'channel' && b.type !== 'channel') return -1;
      if (a.type !== 'channel' && b.type === 'channel') return 1;
      if (a.type === 'supergroup' && b.type === 'group') return -1;
      if (a.type === 'group' && b.type === 'supergroup') return 1;
      
      // If same type, sort alphabetically by title
      return a.title.localeCompare(b.title);
    });
    
    console.log(`Found ${chatList.length} total chats (${chatList.filter(c => c.type === 'channel').length} channels)`);
    return chatList;
  }

  /**
   * Detects chats from getUpdates API, with special focus on my_chat_member updates
   */
  private async detectChatsFromUpdates(chatMap: Map<string, any>) {
    try {
      console.log("Detecting chats from getUpdates API...");
      
      // Get updates with specific focus on my_chat_member updates which indicate bot status changes
      const updatesResponse = await fetch(
        `https://api.telegram.org/bot${this.botToken}/getUpdates?limit=100&allowed_updates=["message","channel_post","my_chat_member"]`
      );
      const updatesData = await updatesResponse.json();
      
      if (!updatesResponse.ok || !updatesData.ok) {
        console.error("Failed to get updates:", updatesData);
        return;
      }
      
      const updates = updatesData.result || [];
      console.log(`Processing ${updates.length} updates from getUpdates`);
      
      for (const update of updates) {
        // Process my_chat_member updates (highest priority - these tell us about the bot's status changes)
        if (update.my_chat_member && update.my_chat_member.chat) {
          const chat = update.my_chat_member.chat;
          const newStatus = update.my_chat_member.new_chat_member?.status;
          
          // Only consider if the bot is administrator or creator
          if (newStatus === 'administrator' || newStatus === 'creator') {
            this.addChatToMap(chatMap, chat);
            console.log(`Found chat from my_chat_member: ${chat.title} (${chat.type}) - Bot is ${newStatus}`);
          }
        }
        
        // Process regular messages (less reliable for channel membership)
        if (update.message && update.message.chat) {
          const chat = update.message.chat;
          this.addChatToMap(chatMap, chat);
        }
        
        // Process channel posts (good for finding channels)
        if (update.channel_post && update.channel_post.chat) {
          const chat = update.channel_post.chat;
          this.addChatToMap(chatMap, chat);
          console.log(`Found channel from channel_post: ${chat.title}`);
        }
      }
      
      console.log(`Found ${chatMap.size} chats from updates`);
    } catch (error) {
      console.error("Error detecting chats from updates:", error);
    }
  }

  /**
   * Verifies bot admin status for all detected chats
   */
  private async verifyBotAdminStatus(chatMap: Map<string, any>) {
    if (!this.botId) return;
    
    console.log("Verifying bot admin status for detected chats...");
    const chatIds = Array.from(chatMap.keys());
    
    for (const chatId of chatIds) {
      try {
        // Get chat member info for the bot
        const response = await fetch(
          `https://api.telegram.org/bot${this.botToken}/getChatMember?chat_id=${chatId}&user_id=${this.botId}`
        );
        const data = await response.json();
        
        if (response.ok && data.ok) {
          const status = data.result.status;
          
          // Update the isAdmin status
          const chat = chatMap.get(chatId);
          if (chat) {
            chat.botStatus = status;
            chat.isAdmin = status === 'administrator' || status === 'creator';
            
            if (chat.isAdmin) {
              console.log(`Confirmed: Bot is ${status} in ${chat.title} (${chat.type})`);
              
              // For channels and groups where bot is admin, try to get additional info
              await this.enrichChatInfo(chat);
            } else {
              console.log(`Bot is only ${status} in ${chat.title}, not an admin`);
              
              // Remove chats where bot is not an admin
              if (status !== 'administrator' && status !== 'creator') {
                chatMap.delete(chatId);
              }
            }
          }
        }
      } catch (error) {
        console.warn(`Error checking admin status for chat ${chatId}:`, error);
      }
    }
  }

  /**
   * Attempts to detect popular channels as a fallback
   */
  private async detectPopularChannels(chatMap: Map<string, any>) {
    if (chatMap.size > 0) return; // Skip if we already found chats
    
    console.log("Attempting to detect popular channels as fallback...");
    const testChannels = ['test', 'durov', 'telegram'];
    
    for (const username of testChannels) {
      try {
        // Try to get chat info
        const response = await fetch(
          `https://api.telegram.org/bot${this.botToken}/getChat?chat_id=@${username}`
        );
        const data = await response.json();
        
        if (response.ok && data.ok && data.result) {
          console.log(`Successfully accessed channel @${username}`);
          
          // Now check if bot is admin in this channel
          if (this.botId) {
            const memberResponse = await fetch(
              `https://api.telegram.org/bot${this.botToken}/getChatMember?chat_id=@${username}&user_id=${this.botId}`
            );
            const memberData = await memberResponse.json();
            
            if (memberResponse.ok && memberData.ok) {
              const status = memberData.result.status;
              if (status === 'administrator' || status === 'creator') {
                this.addChatToMap(chatMap, data.result);
                console.log(`Bot is ${status} in @${username}, adding to list`);
              }
            }
          }
        }
      } catch (error) {
        console.warn(`Error checking channel @${username}:`, error);
      }
    }
  }

  /**
   * Enriches chat information with additional details like photo
   */
  private async enrichChatInfo(chat: any) {
    try {
      const response = await fetch(
        `https://api.telegram.org/bot${this.botToken}/getChat?chat_id=${chat.id}`
      );
      const data = await response.json();
      
      if (response.ok && data.ok && data.result) {
        // Update with any additional info
        if (data.result.username && !chat.username) {
          chat.username = data.result.username;
        }
        
        // Get chat photo if available
        if (data.result.photo) {
          try {
            const fileResponse = await fetch(
              `https://api.telegram.org/bot${this.botToken}/getFile?file_id=${data.result.photo.big_file_id}`
            );
            const fileData = await fileResponse.json();
            
            if (fileResponse.ok && fileData.ok && fileData.result && fileData.result.file_path) {
              chat.photo_url = `https://api.telegram.org/file/bot${this.botToken}/${fileData.result.file_path}`;
            }
          } catch (photoError) {
            console.warn(`Error getting photo for ${chat.title}:`, photoError);
          }
        }
        
        // For channels, try to get chat administrators
        if (chat.type === 'channel' || chat.type === 'supergroup') {
          try {
            const adminResponse = await fetch(
              `https://api.telegram.org/bot${this.botToken}/getChatAdministrators?chat_id=${chat.id}`
            );
            
            if (adminResponse.ok) {
              console.log(`Successfully got admins list for ${chat.title}`);
              chat.confirmed_admin_access = true;
            }
          } catch (adminError) {
            console.warn(`Error checking admins for ${chat.title}:`, adminError);
          }
        }
      }
    } catch (error) {
      console.warn(`Error enriching chat info for ${chat.title}:`, error);
    }
  }

  /**
   * Helper method to add a chat to the map with proper structure
   */
  private addChatToMap(chatMap: Map<string, any>, chat: any) {
    if (!chat || !chat.id || !chat.type) return;
    
    // Skip chats we already have
    if (chatMap.has(chat.id.toString())) return;
    
    // Only accept channels, supergroups, and groups
    if (!['channel', 'supergroup', 'group'].includes(chat.type)) return;
    
    chatMap.set(chat.id.toString(), {
      id: chat.id.toString(),
      title: chat.title || 'Unnamed Chat',
      type: chat.type,
      username: chat.username || null,
      photo_url: null,
      isAdmin: false // Will be verified later
    });
  }
}
