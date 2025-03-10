
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { logDbOperation } from './dbLogger.ts';

/**
 * Manages Telegram chat member operations
 */
export class TelegramMemberManager {
  private botToken: string;
  private supabase: ReturnType<typeof createClient>;

  constructor(supabase: ReturnType<typeof createClient>, botToken: string) {
    this.supabase = supabase;
    this.botToken = botToken;
  }

  /**
   * Kicks a member from a Telegram chat
   * 
   * @param chatId The chat ID
   * @param userId The user ID to kick
   * @param reason The reason for kicking ('expired' or 'removed')
   * @returns True if successful, false otherwise
   */
  async kickChatMember(chatId: string, userId: string, reason: 'expired' | 'removed' = 'removed'): Promise<boolean> {
    try {
      console.log('[Member Manager] Attempting to kick user:', { chatId, userId, reason });
      
      // Validate inputs
      if (!chatId || !userId || !this.botToken) {
        console.error('[Member Manager] Missing required parameters:', { 
          hasChatId: !!chatId, 
          hasUserId: !!userId, 
          hasBotToken: !!this.botToken 
        });
        return false;
      }

      // First try to kick the member using banChatMember with a short ban time
      const kickResult = await this.banChatMember(chatId, userId);
      
      if (!kickResult.success) {
        // If banChatMember failed, try the deprecated kickChatMember method as fallback
        console.warn('[Member Manager] banChatMember failed, trying kickChatMember as fallback');
        
        const fallbackResult = await this.legacyKickChatMember(chatId, userId);
        
        if (!fallbackResult.success) {
          console.error('[Member Manager] Both kick methods failed:', fallbackResult.description);
          return false;
        }
      }

      // After a short delay, unban the user to allow them to rejoin in the future
      // Wait 2 seconds before unbanning
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const unbanResult = await this.unbanChatMember(chatId, userId);
      console.log('[Member Manager] Unban result:', unbanResult);

      // Update the database status - preserve the reason!
      const updateSuccess = await this.updateMemberStatus(userId, chatId, reason);
      
      if (!updateSuccess) {
        console.warn('[Member Manager] Database update failed, but user was kicked');
        // Continue despite db error since the kick was successful
      }

      // Log the action with the correct reason
      await this.logMemberKick(userId, chatId, reason);

      return true;
    } catch (error) {
      console.error('[Member Manager] Error:', error);
      return false;
    }
  }

  /**
   * Ban a chat member with short duration (Telegram's recommended way to kick)
   */
  private async banChatMember(chatId: string, userId: string): Promise<{success: boolean, description?: string}> {
    try {
      const response = await fetch(`https://api.telegram.org/bot${this.botToken}/banChatMember`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          user_id: userId,
          until_date: Math.floor(Date.now() / 1000) + 40 // 40 seconds ban (minimum allowed by Telegram)
        })
      });

      const result = await response.json();
      console.log('[Member Manager] Ban result:', result);
      
      return { 
        success: result.ok,
        description: result.description
      };
    } catch (error) {
      console.error('[Member Manager] Error in banChatMember:', error);
      return {
        success: false,
        description: error.message
      };
    }
  }

  /**
   * Legacy method to kick chat member (deprecated by Telegram but kept as fallback)
   */
  private async legacyKickChatMember(chatId: string, userId: string): Promise<{success: boolean, description?: string}> {
    try {
      const response = await fetch(`https://api.telegram.org/bot${this.botToken}/kickChatMember`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          user_id: userId
        })
      });
      
      const result = await response.json();
      console.log('[Member Manager] Legacy kick result:', result);
      
      return { 
        success: result.ok,
        description: result.description
      };
    } catch (error) {
      console.error('[Member Manager] Error in legacyKickChatMember:', error);
      return {
        success: false,
        description: error.message
      };
    }
  }

  /**
   * Unban a chat member so they can rejoin in the future
   */
  private async unbanChatMember(chatId: string, userId: string): Promise<{success: boolean, description?: string}> {
    try {
      const response = await fetch(`https://api.telegram.org/bot${this.botToken}/unbanChatMember`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          user_id: userId,
          only_if_banned: true
        })
      });

      const result = await response.json();
      
      return { 
        success: result.ok,
        description: result.description
      };
    } catch (error) {
      console.error('[Member Manager] Error in unbanChatMember:', error);
      return {
        success: false,
        description: error.message
      };
    }
  }

  /**
   * Update the member status in the database
   */
  private async updateMemberStatus(userId: string, chatId: string, reason: 'expired' | 'removed' = 'removed'): Promise<boolean> {
    try {
      console.log(`[Member Manager] Updating member status with reason: ${reason}`);
      
      const { error } = await this.supabase
        .from('telegram_chat_members')
        .update({
          is_active: false,
          subscription_status: reason // Use the reason as the status - important fix!
        })
        .eq('telegram_user_id', userId)
        .eq('community_id', chatId);

      if (error) {
        console.error('[Member Manager] Error updating database:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('[Member Manager] Error in updateMemberStatus:', error);
      return false;
    }
  }

  /**
   * Log the member kick to the activity logs
   */
  private async logMemberKick(userId: string, chatId: string, reason: 'expired' | 'removed' = 'removed'): Promise<void> {
    try {
      const activityType = reason === 'expired' ? 'subscription_expired' : 'member_kicked';
      const details = reason === 'expired' 
        ? 'Member removed from channel due to subscription expiration'
        : 'Member removed from channel due to subscription cancellation';
        
      await this.supabase
        .from('subscription_activity_logs')
        .insert({
          telegram_user_id: userId,
          community_id: chatId,
          activity_type: activityType,
          details: details,
          status: reason
        });
      
      console.log(`[Member Manager] Successfully logged kick action with reason: ${reason}`);
    } catch (error) {
      console.error('[Member Manager] Error logging kick action:', error);
      // Non-critical error, don't throw
    }
  }
}
