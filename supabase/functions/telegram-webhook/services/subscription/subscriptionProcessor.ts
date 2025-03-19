
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createLogger } from '../loggingService.ts';
import { TelegramApiClient } from '../../utils/telegramApiClient.ts';

/**
 * Service for processing user subscriptions
 */
export class SubscriptionProcessor {
  private supabase: ReturnType<typeof createClient>;
  private logger: ReturnType<typeof createLogger>;
  
  constructor(supabase: ReturnType<typeof createClient>) {
    this.supabase = supabase;
    this.logger = createLogger(supabase, 'SUBSCRIPTION-PROCESSOR');
  }
  
  /**
   * Process subscription for a user
   */
  async processSubscription(
    userId: string,
    payload: any,
    userInfo: any,
    telegramApi: TelegramApiClient
  ): Promise<void> {
    try {
      // Check if the user is already a member
      const { data: existingMember } = await this.supabase
        .from('telegram_chat_members')
        .select('*')
        .eq('telegram_user_id', userId)
        .eq('community_id', payload.communityId)
        .single();
      
      // Calculate subscription end date based on plan
      let subscriptionEndDate = new Date();
      
      // Get plan details
      const { data: planData, error: planError } = await this.supabase
        .from('subscription_plans')
        .select('interval')
        .eq('id', payload.planId)
        .maybeSingle();
        
      if (planError) {
        await this.logger.error(`Error getting plan details: ${planError.message}`);
      } else if (planData?.interval) {
        await this.logger.info(`Using plan interval: ${planData.interval}`);
        
        const interval = planData.interval;
        subscriptionEndDate = this.calculateEndDate(subscriptionEndDate, interval);
      } else {
        // Default to 1 month if no plan found
        subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);
        await this.logger.warn('No plan found, defaulting to 1 month subscription');
      }
      
      if (existingMember) {
        await this.updateExistingMember(existingMember.id, payload.planId, subscriptionEndDate);
      } else {
        await this.createNewMember(userId, userInfo, payload.communityId, payload.planId, subscriptionEndDate);
      }
      
      // Log the subscription activity
      await this.logSubscriptionActivity(userId, payload.communityId);
    } catch (error) {
      await this.logger.error(`Error processing subscription: ${error.message}`);
      throw error;
    }
  }

  /**
   * Calculate subscription end date based on interval
   */
  private calculateEndDate(startDate: Date, interval: string): Date {
    const endDate = new Date(startDate);
    
    if (interval === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (interval === 'quarterly') {
      endDate.setMonth(endDate.getMonth() + 3);
    } else if (interval === 'half-yearly') {
      endDate.setMonth(endDate.getMonth() + 6);
    } else if (interval === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else if (interval === 'lifetime') {
      // Set to a very far future date for lifetime
      endDate.setFullYear(endDate.getFullYear() + 100);
    } else {
      // Default to 1 month for unknown intervals
      endDate.setMonth(endDate.getMonth() + 1);
    }
    
    return endDate;
  }

  /**
   * Update existing member record
   */
  private async updateExistingMember(
    memberId: string, 
    planId: string,
    endDate: Date
  ): Promise<void> {
    await this.supabase
      .from('telegram_chat_members')
      .update({
        subscription_status: 'active',
        is_active: true,
        subscription_start_date: new Date().toISOString(),
        subscription_end_date: endDate.toISOString(),
        subscription_plan_id: planId
      })
      .eq('id', memberId);
    
    await this.logger.info(`Updated existing member ${memberId} with plan ${planId}`);
  }

  /**
   * Create new member record
   */
  private async createNewMember(
    userId: string,
    userInfo: any,
    communityId: string,
    planId: string,
    endDate: Date
  ): Promise<void> {
    await this.supabase
      .from('telegram_chat_members')
      .insert({
        telegram_user_id: userId,
        telegram_username: userInfo.username || null,
        community_id: communityId,
        subscription_status: 'active',
        is_active: true,
        subscription_start_date: new Date().toISOString(),
        subscription_end_date: endDate.toISOString(),
        subscription_plan_id: planId
      });
    
    await this.logger.info(`Added new member ${userId} to community ${communityId}`);
  }

  /**
   * Log subscription activity
   */
  private async logSubscriptionActivity(
    userId: string,
    communityId: string
  ): Promise<void> {
    await this.supabase
      .from('subscription_activity_logs')
      .insert({
        telegram_user_id: userId,
        community_id: communityId,
        activity_type: 'payment_received',
        details: `Payment received via Telegram`,
        status: 'active'
      });
  }
}
