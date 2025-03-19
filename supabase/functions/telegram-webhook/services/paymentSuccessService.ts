
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createLogger } from './loggingService.ts';
import { TelegramApiClient } from '../utils/telegramApiClient.ts';
import { JoinRequestService } from './joinRequestService.ts';
import { SubscriptionProcessor } from './subscription/subscriptionProcessor.ts';
import { InviteLinkService } from './invite/inviteLinkService.ts';
import { PaymentRecordService } from './payment/paymentRecordService.ts';
import { UserNotificationService } from './notification/userNotificationService.ts';

export class PaymentSuccessService {
  private supabase: ReturnType<typeof createClient>;
  private logger: ReturnType<typeof createLogger>;
  private subscriptionProcessor: SubscriptionProcessor;
  private inviteLinkService: InviteLinkService;
  private paymentRecordService: PaymentRecordService;
  private userNotificationService: UserNotificationService;
  
  constructor(supabase: ReturnType<typeof createClient>) {
    this.supabase = supabase;
    this.logger = createLogger(supabase, 'PAYMENT-SUCCESS-SERVICE');
    this.subscriptionProcessor = new SubscriptionProcessor(supabase);
    this.inviteLinkService = new InviteLinkService(supabase);
    this.paymentRecordService = new PaymentRecordService(supabase);
    this.userNotificationService = new UserNotificationService(supabase);
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
      
      // Log and record the payment
      await this.paymentRecordService.logPaymentActivity(message.from.id.toString(), payment, payload);
      const { paymentRecord, error: paymentError } = await this.paymentRecordService.recordPayment(
        message.from.id.toString(), 
        message.from, 
        payment, 
        payload
      );
      
      if (paymentError) {
        await this.logger.error(`Error recording payment: ${paymentError.message}`);
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
      await this.subscriptionProcessor.processSubscription(
        message.from.id.toString(), 
        payload, 
        message.from, 
        telegramApi
      );
      
      // Get or create invite link
      const inviteLink = await this.inviteLinkService.getOrCreateInviteLink(
        payload.communityId,
        telegramApi,
        message.from.username || message.from.id,
        paymentRecord?.id
      );
      
      // Get community info for better user message
      const { data: community } = await this.supabase
        .from('communities')
        .select('name')
        .eq('id', payload.communityId)
        .single();
      
      // Send thank you message to the user
      await this.userNotificationService.sendThankYouMessage(
        message.from.id.toString(),
        telegramApi,
        inviteLink,
        community?.name
      );
      
      // Try to approve any pending join requests for this user
      await this.handleJoinRequestApproval(
        payload.communityId,
        message.from,
        botToken
      );
      
      return true;
    } catch (error) {
      await this.logger.error(`Error handling successful payment: ${error.message}`);
      return false;
    }
  }

  /**
   * Handle join request approval after payment
   */
  private async handleJoinRequestApproval(
    communityId: string,
    userInfo: any,
    botToken: string
  ): Promise<void> {
    try {
      // Get community chat ID
      const { data: community } = await this.supabase
        .from('communities')
        .select('telegram_chat_id')
        .eq('id', communityId)
        .single();
        
      if (community?.telegram_chat_id) {
        const joinRequestService = new JoinRequestService(this.supabase, botToken);
        
        // Try to approve any pending join request
        const approveResult = await joinRequestService.approveJoinRequest(
          community.telegram_chat_id,
          userInfo.id.toString(),
          userInfo.username,
          'Payment received'
        );
        
        if (approveResult) {
          await this.logger.success(`Auto-approved join request for user ${userInfo.id} after payment`);
        }
      }
    } catch (error) {
      await this.logger.error(`Error handling join request approval: ${error.message}`);
    }
  }
}
