
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { logJoinRequestEvent } from '../utils/logHelper.ts';
import { createOrUpdateMember } from '../utils/dbLogger.ts';
import { updateCommunityMemberCount } from '../utils/communityCountUtils.ts';
import { TelegramApiClient } from '../utils/telegramApiClient.ts';

/**
 * Service for handling join requests
 */
export class JoinRequestService {
  private supabase: ReturnType<typeof createClient>;
  private telegramApi: TelegramApiClient;

  constructor(supabase: ReturnType<typeof createClient>, botToken: string) {
    this.supabase = supabase;
    this.telegramApi = new TelegramApiClient(botToken);
  }

  /**
   * Checks if a user has an active subscription for the given community
   * @param userId The Telegram user ID
   * @param username The Telegram username
   * @param communityId The community ID
   * @returns Whether the subscription is active and the member data if found
   */
  async checkSubscription(userId: string, username: string | undefined, communityId: string) {
    console.log(`[JOIN-SERVICE] 🔍 Looking for existing member record with telegram_user_id: ${userId} and community_id: ${communityId}`);
    
    const { data: memberData, error: memberError } = await this.supabase
      .from('telegram_chat_members')
      .select('id, subscription_status, subscription_end_date')
      .eq('community_id', communityId)
      .eq('telegram_user_id', userId)
      .maybeSingle();

    console.log(`[JOIN-SERVICE] Member query result:`, {
      memberFound: !!memberData,
      memberData,
      memberError
    });

    // If member exists, check if subscription is active
    if (memberData) {
      const isActive = memberData.subscription_status && 
                      memberData.subscription_end_date && 
                      new Date(memberData.subscription_end_date) > new Date();
      
      console.log(`[JOIN-SERVICE] 🔍 Checking subscription status:`, {
        status: memberData.subscription_status,
        endDate: memberData.subscription_end_date,
        isActive
      });
      
      return { 
        hasActiveSub: isActive, 
        memberData 
      };
    }

    return { hasActiveSub: false, memberData: null };
  }

  /**
   * Checks if the user has a payment record for the given community
   * @param userId The Telegram user ID
   * @param username The Telegram username
   * @param communityId The community ID
   * @returns The payment data if found
   */
  async findPayment(userId: string, username: string | undefined, communityId: string) {
    console.log(`[JOIN-SERVICE] 🔍 No member record found, checking for payments for user ${userId}`);
    
    // Build payment query with all possible user identifiers
    let paymentQuery = this.supabase
      .from('subscription_payments')
      .select('*')
      .eq('community_id', communityId)
      .eq('status', 'successful');
    
    // Build OR condition for user ID or username
    const orConditions = [];
    if (userId) {
      orConditions.push(`telegram_user_id.eq.${userId}`);
    }
    if (username) {
      orConditions.push(`telegram_username.eq.${username}`);
    }
    
    if (orConditions.length > 0) {
      paymentQuery = paymentQuery.or(orConditions.join(','));
    }
    
    // Log the query we're about to run
    console.log(`[JOIN-SERVICE] 🔍 Running payment query with OR conditions: ${orConditions.join(',')}`);
    
    const { data: paymentData, error: paymentError } = await paymentQuery
      .order('created_at', { ascending: false })
      .limit(1);

    console.log(`[JOIN-SERVICE] Payment query result:`, {
      paymentsFound: paymentData?.length || 0,
      paymentData,
      paymentError
    });

    return paymentData && paymentData.length > 0 ? paymentData[0] : null;
  }

  /**
   * Creates a member record based on payment data
   * @param userId The Telegram user ID
   * @param username The Telegram username
   * @param communityId The community ID
   * @param paymentData The payment data
   * @returns The result of the member creation
   */
  async createMemberFromPayment(userId: string, username: string | undefined, communityId: string, paymentData: any) {
    console.log(`[JOIN-SERVICE] 📝 Creating member record for user ${userId} in community ${communityId}`);
    
    // Calculate subscription dates
    const subscriptionStartDate = new Date();
    let subscriptionEndDate = new Date(subscriptionStartDate);
    
    // If we have a plan, try to get its interval to set the end date
    if (paymentData.plan_id) {
      console.log(`[JOIN-SERVICE] 🔍 Looking up plan interval for plan ID: ${paymentData.plan_id}`);
      const { data: plan, error: planError } = await this.supabase
        .from('subscription_plans')
        .select('interval')
        .eq('id', paymentData.plan_id)
        .single();
        
      if (plan) {
        console.log(`[JOIN-SERVICE] Setting subscription end date based on interval: ${plan.interval}`);
        if (plan.interval === 'monthly') {
          subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30);
        } else if (plan.interval === 'yearly') {
          subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 365);
        } else if (plan.interval === 'half-yearly') {
          subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 180);
        } else if (plan.interval === 'quarterly') {
          subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 90);
        } else {
          // Default to 30 days if interval is unknown
          subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30);
        }
      } else {
        subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30);
      }
    } else {
      subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30);
    }
    
    // Create the member record
    return await createOrUpdateMember(this.supabase, {
      telegram_user_id: userId,
      telegram_username: username,
      community_id: communityId,
      subscription_status: true,
      subscription_plan_id: paymentData.plan_id,
      subscription_start_date: subscriptionStartDate.toISOString(),
      subscription_end_date: subscriptionEndDate.toISOString(),
      is_active: true
    });
  }

  /**
   * Updates payment record with user ID if not set
   * @param paymentId The payment ID
   * @param userId The Telegram user ID
   */
  async updatePaymentWithUserId(paymentId: string, userId: string) {
    if (!userId) return;
    
    console.log(`[JOIN-SERVICE] Updating payment record with telegram_user_id: ${userId}`);
    await this.supabase
      .from('subscription_payments')
      .update({ telegram_user_id: userId })
      .eq('id', paymentId);
  }

  /**
   * Approves a join request
   * @param chatId The chat ID
   * @param userId The user ID
   * @param username The username
   * @param reason The reason for approval
   * @returns The result of the approval
   */
  async approveJoinRequest(chatId: string, userId: string, username: string | undefined, reason: string) {
    console.log(`[JOIN-SERVICE] ✅ ${reason} for user ${userId}, approving join request`);
    const approveResult = await this.telegramApi.approveJoinRequest(chatId, userId);
    console.log(`[JOIN-SERVICE] ✓ Approve result:`, approveResult);
    
    // Log the join request approval
    await logJoinRequestEvent(
      this.supabase,
      chatId,
      userId,
      username,
      'approved',
      reason,
      approveResult
    );
    
    return approveResult;
  }

  /**
   * Rejects a join request
   * @param chatId The chat ID
   * @param userId The user ID
   * @param username The username
   * @param reason The reason for rejection
   * @returns The result of the rejection
   */
  async rejectJoinRequest(chatId: string, userId: string, username: string | undefined, reason: string) {
    console.log(`[JOIN-SERVICE] ❌ ${reason} for user ${userId}, rejecting join request`);
    const rejectResult = await this.telegramApi.rejectJoinRequest(chatId, userId);
    console.log(`[JOIN-SERVICE] 🚫 Reject result:`, rejectResult);
    
    // Log the join request rejection
    await logJoinRequestEvent(
      this.supabase,
      chatId,
      userId,
      username,
      'rejected',
      reason,
      rejectResult
    );
    
    return rejectResult;
  }
}
