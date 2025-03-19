
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createLogger } from './loggingService.ts';
import { TelegramApiClient } from '../utils/telegramApiClient.ts';
import { JoinRequestService } from './joinRequestService.ts';

export class PaymentSuccessService {
  private supabase: ReturnType<typeof createClient>;
  private logger: ReturnType<typeof createLogger>;
  
  constructor(supabase: ReturnType<typeof createClient>) {
    this.supabase = supabase;
    this.logger = createLogger(supabase, 'PAYMENT-SUCCESS-SERVICE');
  }
  
  /**
   * Handle a successful payment from Telegram
   */
  async handleSuccessfulPayment(message: any): Promise<boolean> {
    try {
      const payment = message.successful_payment;
      await this.logger.info(`Processing successful payment from user ${message.from.id} with amount ${payment.total_amount / 100} ${payment.currency}`);
      
      // Parse the payload
      let payload;
      try {
        payload = JSON.parse(payment.invoice_payload);
      } catch (e) {
        payload = { communityId: payment.invoice_payload };
      }
      
      // Log the successful payment
      await this.supabase
        .from('telegram_activity_logs')
        .insert({
          telegram_user_id: message.from.id.toString(),
          activity_type: 'successful_payment',
          details: `Successful payment of ${payment.total_amount / 100} ${payment.currency}`,
          metadata: {
            ...payload,
            payment_id: payment.telegram_payment_charge_id,
            provider_payment_id: payment.provider_payment_charge_id,
            shipping_option_id: payment.shipping_option_id,
            order_info: payment.order_info
          }
        });
      
      // Record the payment in the database
      const { data: paymentRecord, error: paymentError } = await this.supabase
        .from('subscription_payments')
        .insert({
          telegram_user_id: message.from.id.toString(),
          telegram_payment_id: payment.telegram_payment_charge_id,
          amount: payment.total_amount / 100,
          payment_method: 'telegram',
          status: 'successful',
          community_id: payload.communityId,
          plan_id: payload.planId,
          telegram_username: message.from.username || null,
          first_name: message.from.first_name || null,
          last_name: message.from.last_name || null
        })
        .select()
        .single();
      
      if (paymentError) {
        await this.logger.error(`Error recording payment in database: ${paymentError.message}`);
      } else {
        await this.logger.success('Payment recorded successfully');
      }
      
      // Get bot token from settings
      const { data: settings, error: settingsError } = await this.supabase
        .from('telegram_global_settings')
        .select('bot_token')
        .single();
        
      if (settingsError || !settings?.bot_token) {
        await this.logger.error("Error fetching bot token: " + (settingsError?.message || "Token not found"));
        throw new Error('Bot token not found in settings');
      }
      
      const botToken = settings.bot_token;
      const telegramApi = new TelegramApiClient(botToken);
      
      // Process membership and subscription
      await this.processSubscription(message.from.id.toString(), payload, message.from, telegramApi);
      
      // Get community information and invite link
      const { data: community } = await this.supabase
        .from('communities')
        .select('telegram_invite_link, telegram_chat_id, name')
        .eq('id', payload.communityId)
        .single();
        
      // Get or generate an invite link if needed
      let inviteLink = community?.telegram_invite_link;
      
      if (!inviteLink && community?.telegram_chat_id) {
        try {
          // Try to create a new invite link
          const inviteResult = await telegramApi.createChatInviteLink(
            community.telegram_chat_id, 
            `Invite for ${message.from.username || message.from.id} (${new Date().toISOString()})`
          );
          
          if (inviteResult.ok && inviteResult.result?.invite_link) {
            inviteLink = inviteResult.result.invite_link;
            
            // Update community with the new invite link
            await this.supabase
              .from('communities')
              .update({ telegram_invite_link: inviteLink })
              .eq('id', payload.communityId);
              
            // Also update the payment record with the invite link
            if (paymentRecord?.id) {
              await this.supabase
                .from('subscription_payments')
                .update({ invite_link: inviteLink })
                .eq('id', paymentRecord.id);
            }
            
            await this.logger.info(`Created and stored new invite link: ${inviteLink}`);
          }
        } catch (inviteError) {
          await this.logger.error(`Error creating invite link: ${inviteError.message}`);
        }
      }
      
      // Send thank you message to the user
      let thankYouMessage = "Thank you for your payment! Your subscription has been activated.";
      
      if (inviteLink) {
        thankYouMessage += `\n\nYou can join the community using this link: ${inviteLink}`;
      } else {
        thankYouMessage += "\n\nYou can now join the community by sending a join request to the group.";
      }
      
      await telegramApi.sendMessage(message.from.id.toString(), thankYouMessage);
      
      await this.logger.success('Sent thank you message to user');
      
      // Try to approve any pending join requests for this user
      if (community?.telegram_chat_id) {
        const joinRequestService = new JoinRequestService(this.supabase, botToken);
        
        // Try to approve any pending join request
        const approveResult = await joinRequestService.approveJoinRequest(
          community.telegram_chat_id,
          message.from.id.toString(),
          message.from.username,
          'Payment received'
        );
        
        if (approveResult) {
          await this.logger.success(`Auto-approved join request for user ${message.from.id} after payment`);
        }
      }
      
      return true;
    } catch (error) {
      await this.logger.error(`Error handling successful payment: ${error.message}`);
      return false;
    }
  }

  /**
   * Process subscription for a user
   */
  private async processSubscription(
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
        if (interval === 'monthly') {
          subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);
        } else if (interval === 'quarterly') {
          subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 3);
        } else if (interval === 'half-yearly') {
          subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 6);
        } else if (interval === 'yearly') {
          subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1);
        } else if (interval === 'lifetime') {
          // Set to a very far future date for lifetime
          subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 100);
        } else {
          // Default to 1 month for unknown intervals
          subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);
        }
      } else {
        // Default to 1 month if no plan found
        subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);
        await this.logger.warn('No plan found, defaulting to 1 month subscription');
      }
      
      if (existingMember) {
        // Update existing member
        await this.supabase
          .from('telegram_chat_members')
          .update({
            subscription_status: 'active',
            is_active: true,
            subscription_start_date: new Date().toISOString(),
            subscription_end_date: subscriptionEndDate.toISOString(),
            subscription_plan_id: payload.planId
          })
          .eq('id', existingMember.id);
        
        await this.logger.info(`Updated existing member ${userId} in community ${payload.communityId}`);
      } else {
        // Add new member
        await this.supabase
          .from('telegram_chat_members')
          .insert({
            telegram_user_id: userId,
            telegram_username: userInfo.username || null,
            community_id: payload.communityId,
            subscription_status: 'active',
            is_active: true,
            subscription_start_date: new Date().toISOString(),
            subscription_end_date: subscriptionEndDate.toISOString(),
            subscription_plan_id: payload.planId
          });
        
        await this.logger.info(`Added new member ${userId} to community ${payload.communityId}`);
      }
      
      // Log the subscription activity
      await this.supabase
        .from('subscription_activity_logs')
        .insert({
          telegram_user_id: userId,
          community_id: payload.communityId,
          activity_type: 'payment_received',
          details: `Payment received via Telegram`,
          status: 'active'
        });
    } catch (error) {
      await this.logger.error(`Error processing subscription: ${error.message}`);
      throw error;
    }
  }
}
