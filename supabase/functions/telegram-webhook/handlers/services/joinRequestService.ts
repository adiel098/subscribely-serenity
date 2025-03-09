
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { logJoinRequestEvent } from '../utils/logHelper.ts';
import { TelegramApiClient } from '../utils/telegramApiClient.ts';

export class JoinRequestService {
  private supabase: ReturnType<typeof createClient>;
  private telegramApi: TelegramApiClient;
  
  constructor(supabase: ReturnType<typeof createClient>, botToken: string) {
    this.supabase = supabase;
    this.telegramApi = new TelegramApiClient(botToken);
  }
  
  /**
   * Check if a user has an active subscription for a community
   */
  async checkSubscription(userId: string, username: string | undefined, communityId: string): Promise<{
    hasActiveSub: boolean;
    memberData: any | null;
  }> {
    console.log(`[JOIN-REQUEST-SERVICE] 🔍 Checking subscriptions for user ${userId} in community ${communityId}`);
    
    try {
      // Try to find an existing member record
      const { data: memberData, error: memberError } = await this.supabase
        .from('telegram_chat_members')
        .select('*')
        .eq('telegram_user_id', userId)
        .eq('community_id', communityId)
        .maybeSingle();
        
      if (memberError) {
        console.error('[JOIN-REQUEST-SERVICE] ❌ Error checking member subscription:', memberError);
        throw memberError;
      }
      
      if (!memberData) {
        console.log('[JOIN-REQUEST-SERVICE] 🔍 No existing member record found');
        return { hasActiveSub: false, memberData: null };
      }
      
      console.log('[JOIN-REQUEST-SERVICE] ✅ Found member record:', memberData);
      
      const isActiveSubscription = memberData.subscription_status === 'active' && memberData.is_active === true;
      const hasValidEndDate = memberData.subscription_end_date && new Date(memberData.subscription_end_date) > new Date();
      
      // Check if user has an active subscription that hasn't expired
      if (isActiveSubscription && hasValidEndDate) {
        console.log('[JOIN-REQUEST-SERVICE] ✅ User has an active subscription that is not expired');
        return { hasActiveSub: true, memberData };
      }
      
      console.log('[JOIN-REQUEST-SERVICE] ❌ User does not have an active subscription or it has expired');
      return { hasActiveSub: false, memberData };
    } catch (error) {
      console.error('[JOIN-REQUEST-SERVICE] ❌ Error in checkSubscription:', error);
      return { hasActiveSub: false, memberData: null };
    }
  }
  
  /**
   * Find a payment record for a user
   */
  async findPayment(userId: string, username: string | undefined, communityId: string): Promise<any> {
    console.log(`[JOIN-REQUEST-SERVICE] 🔍 Looking for payment records for user ${userId} in community ${communityId}`);
    
    try {
      // Try to find by telegram_user_id
      const { data: paymentByTelegramId, error: telegramIdError } = await this.supabase
        .from('subscription_payments')
        .select('*')
        .eq('telegram_user_id', userId)
        .eq('community_id', communityId)
        .eq('status', 'successful')
        .order('created_at', { ascending: false })
        .maybeSingle();
        
      if (telegramIdError) {
        console.error('[JOIN-REQUEST-SERVICE] ❌ Error checking payment by telegram ID:', telegramIdError);
      } else if (paymentByTelegramId) {
        console.log('[JOIN-REQUEST-SERVICE] ✅ Found payment by telegram ID:', paymentByTelegramId);
        return paymentByTelegramId;
      }
      
      // If username exists, try to find by username
      if (username) {
        console.log(`[JOIN-REQUEST-SERVICE] 🔍 Looking for payment by username: ${username}`);
        
        const { data: paymentByUsername, error: usernameError } = await this.supabase
          .from('subscription_payments')
          .select('*')
          .eq('telegram_username', username)
          .eq('community_id', communityId)
          .eq('status', 'successful')
          .is('telegram_user_id', null) // Only get payments without telegram_user_id
          .order('created_at', { ascending: false })
          .maybeSingle();
          
        if (usernameError) {
          console.error('[JOIN-REQUEST-SERVICE] ❌ Error checking payment by username:', usernameError);
        } else if (paymentByUsername) {
          console.log('[JOIN-REQUEST-SERVICE] ✅ Found payment by username:', paymentByUsername);
          return paymentByUsername;
        }
      }
      
      console.log('[JOIN-REQUEST-SERVICE] ❌ No payment found for user');
      return null;
    } catch (error) {
      console.error('[JOIN-REQUEST-SERVICE] ❌ Error in findPayment:', error);
      return null;
    }
  }
  
  /**
   * Update a payment record with telegram_user_id
   */
  async updatePaymentWithUserId(paymentId: string, userId: string): Promise<boolean> {
    try {
      console.log(`[JOIN-REQUEST-SERVICE] 🔄 Updating payment ${paymentId} with telegram_user_id ${userId}`);
      
      const { error } = await this.supabase
        .from('subscription_payments')
        .update({ telegram_user_id: userId })
        .eq('id', paymentId);
        
      if (error) {
        console.error('[JOIN-REQUEST-SERVICE] ❌ Error updating payment:', error);
        return false;
      }
      
      console.log('[JOIN-REQUEST-SERVICE] ✅ Payment updated successfully');
      return true;
    } catch (error) {
      console.error('[JOIN-REQUEST-SERVICE] ❌ Error in updatePaymentWithUserId:', error);
      return false;
    }
  }
  
  /**
   * Create a member record from a payment
   */
  async createMemberFromPayment(userId: string, username: string | undefined, communityId: string, payment: any): Promise<any> {
    try {
      console.log(`[JOIN-REQUEST-SERVICE] ➕ Creating member record from payment for user ${userId}`);
      
      // Calculate subscription end date based on plan
      let subscriptionEndDate = new Date();
      
      // Get plan details
      const { data: planData, error: planError } = await this.supabase
        .from('subscription_plans')
        .select('interval')
        .eq('id', payment.plan_id)
        .maybeSingle();
        
      if (planError) {
        console.error('[JOIN-REQUEST-SERVICE] ❌ Error getting plan details:', planError);
      } else if (planData?.interval) {
        console.log(`[JOIN-REQUEST-SERVICE] 📅 Using plan interval: ${planData.interval}`);
        
        const interval = planData.interval;
        if (interval === 'monthly') {
          subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);
        } else if (interval === 'quarterly') {
          subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 3);
        } else if (interval === 'half-yearly') {
          subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 6);
        } else if (interval === 'yearly') {
          subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1);
        } else {
          // Default to 1 month for unknown intervals
          subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);
        }
      } else {
        // Default to 1 month if no plan found
        subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);
        console.log('[JOIN-REQUEST-SERVICE] ⚠️ No plan found, defaulting to 1 month subscription');
      }
      
      const memberData = {
        telegram_user_id: userId,
        telegram_username: username,
        community_id: communityId,
        subscription_plan_id: payment.plan_id,
        subscription_start_date: new Date().toISOString(),
        subscription_end_date: subscriptionEndDate.toISOString(),
        subscription_status: 'active',
        is_active: true,
        joined_at: new Date().toISOString()
      };
      
      console.log('[JOIN-REQUEST-SERVICE] 📝 Creating member with data:', memberData);
      
      const { data, error } = await this.supabase
        .from('telegram_chat_members')
        .insert(memberData)
        .select()
        .single();
        
      if (error) {
        console.error('[JOIN-REQUEST-SERVICE] ❌ Error creating member:', error);
        return { success: false, error };
      }
      
      console.log('[JOIN-REQUEST-SERVICE] ✅ Member created successfully');
      return { success: true, data };
    } catch (error) {
      console.error('[JOIN-REQUEST-SERVICE] ❌ Error in createMemberFromPayment:', error);
      return { success: false, error };
    }
  }
  
  /**
   * Approve a join request
   */
  async approveJoinRequest(chatId: string, userId: string, username: string | undefined, reason: string): Promise<boolean> {
    try {
      console.log(`[JOIN-REQUEST-SERVICE] ✅ Approving join request for user ${userId} to chat ${chatId}`);
      
      // Call Telegram API to approve join request
      await this.telegramApi.approveJoinRequest(chatId, userId);
      
      // Log the approval
      await logJoinRequestEvent(
        this.supabase,
        chatId,
        userId,
        username,
        'approved',
        `Join request approved: ${reason}`,
        null
      );
      
      console.log(`[JOIN-REQUEST-SERVICE] ✅ Successfully approved join request for user ${userId}`);
      return true;
    } catch (error) {
      console.error('[JOIN-REQUEST-SERVICE] ❌ Error approving join request:', error);
      
      // Log the error
      await logJoinRequestEvent(
        this.supabase,
        chatId,
        userId,
        username,
        'approval_error',
        `Error approving join request: ${error.message}`,
        null
      );
      
      return false;
    }
  }
  
  /**
   * Reject a join request
   */
  async rejectJoinRequest(chatId: string, userId: string, username: string | undefined, reason: string): Promise<boolean> {
    try {
      console.log(`[JOIN-REQUEST-SERVICE] ❌ Rejecting join request for user ${userId} to chat ${chatId}`);
      
      // Call Telegram API to reject join request
      await this.telegramApi.rejectJoinRequest(chatId, userId);
      
      // Log the rejection
      await logJoinRequestEvent(
        this.supabase,
        chatId,
        userId,
        username,
        'rejected',
        `Join request rejected: ${reason}`,
        null
      );
      
      console.log(`[JOIN-REQUEST-SERVICE] ✅ Successfully rejected join request for user ${userId}`);
      return true;
    } catch (error) {
      console.error('[JOIN-REQUEST-SERVICE] ❌ Error rejecting join request:', error);
      
      // Log the error
      await logJoinRequestEvent(
        this.supabase,
        chatId,
        userId,
        username,
        'rejection_error',
        `Error rejecting join request: ${error.message}`,
        null
      );
      
      return false;
    }
  }
}
