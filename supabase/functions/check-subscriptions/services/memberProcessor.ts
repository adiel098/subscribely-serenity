
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { TelegramApiClient } from '../utils/telegramApiClient.ts';
import { MemberStatusService } from '../../telegram-webhook/services/subscription/memberStatusService.ts';
import { MemberRemovalService } from '../../telegram-webhook/services/subscription/memberRemovalService.ts';

export class MemberProcessor {
  private supabase: ReturnType<typeof createClient>;
  private statusService: MemberStatusService;
  private removalService: MemberRemovalService;
  
  constructor(supabase: ReturnType<typeof createClient>) {
    this.supabase = supabase;
    this.statusService = new MemberStatusService(supabase);
    this.removalService = new MemberRemovalService(supabase);
  }
  
  /**
   * Process a member to check subscription status and take appropriate action
   */
  async processMember(member: any, communityInfo: any, botSettings: any, telegramApi: TelegramApiClient) {
    const now = new Date();
    const subscriptionEndDate = new Date(member.subscription_end_date);
    const memberId = member.member_id;
    const telegramUserId = member.telegram_user_id;
    const isActive = member.is_active;
    const chatId = communityInfo.telegram_chat_id;
    
    console.log(`🔍 Processing member ${telegramUserId} for community ${member.community_id}`);
    console.log(`👤 Member details: ${JSON.stringify(member, null, 2)}`);
    console.log(`📋 Community info: ${JSON.stringify(communityInfo, null, 2)}`);
    console.log(`📋 BOT SETTINGS for ${member.community_id}: ${JSON.stringify(botSettings, null, 2)}`);
    
    // Check if subscription has expired
    if (now > subscriptionEndDate) {
      // Subscription has expired
      if (isActive && botSettings.auto_remove_expired) {
        // Member is active and auto-remove is enabled - remove from chat and mark as expired
        console.log(`⚙️ auto_remove_expired setting is: ENABLED`);
        
        const result = await this.removalService.removeExpiredMember(
          chatId, 
          telegramUserId, 
          memberId,
          telegramApi
        );
        
        return {
          result: "expired_and_removed",
          details: "Subscription expired, member removed from chat and marked as expired",
          success: result.success
        };
      } else if (isActive) {
        // Member is active but auto-remove is disabled - just mark as expired
        console.log(`⚙️ auto_remove_expired setting is: DISABLED`);
        
        await this.statusService.markMemberAsExpired(memberId);
        
        return {
          result: "expired_only",
          details: "Subscription expired, member marked as expired but not removed (auto-remove disabled)",
          success: true
        };
      } else {
        // Member is already inactive, nothing to do
        console.log(`ℹ️ Member ${telegramUserId} is currently marked as inactive`);
        
        return {
          result: "inactive_member",
          details: "Member is marked as inactive",
          success: true
        };
      }
    } else {
      // Subscription is still active
      return {
        result: "active_subscription",
        details: "Subscription is still active",
        success: true
      };
    }
  }
}
