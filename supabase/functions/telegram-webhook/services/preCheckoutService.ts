
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createLogger } from './loggingService.ts';

export class PreCheckoutService {
  private supabase: ReturnType<typeof createClient>;
  private logger: ReturnType<typeof createLogger>;
  
  constructor(supabase: ReturnType<typeof createClient>) {
    this.supabase = supabase;
    this.logger = createLogger(supabase, 'PRE-CHECKOUT-SERVICE');
  }
  
  /**
   * Handle a pre-checkout query from Telegram
   */
  async handlePreCheckoutQuery(query: any): Promise<boolean> {
    try {
      await this.logger.info(`Processing pre-checkout query from user ${query.from.id} with payload: ${query.invoice_payload}`);
      
      // Parse the payload
      let payload;
      try {
        payload = JSON.parse(query.invoice_payload);
      } catch (e) {
        payload = { communityId: query.invoice_payload };
      }
      
      // Log the pre-checkout query
      await this.supabase
        .from('telegram_activity_logs')
        .insert({
          telegram_user_id: query.from.id.toString(),
          activity_type: 'pre_checkout_query',
          details: `Pre-checkout query for ${query.total_amount / 100} ${query.currency}`,
          metadata: payload
        });
      
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
      
      // Answer the pre-checkout query to approve it
      await fetch(`https://api.telegram.org/bot${botToken}/answerPreCheckoutQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pre_checkout_query_id: query.id,
          ok: true
        })
      });
      
      await this.logger.success('Pre-checkout query approved');
      return true;
    } catch (error) {
      await this.logger.error(`Error handling pre-checkout query: ${error.message}`);
      
      // Try to reject the payment if possible
      try {
        // Get bot token from settings
        const { data: settings } = await this.supabase
          .from('telegram_global_settings')
          .select('bot_token')
          .single();
          
        if (!settings?.bot_token) {
          await this.logger.error("Cannot reject payment - bot token not found");
          return false;
        }
        
        const botToken = settings.bot_token;
        
        await fetch(`https://api.telegram.org/bot${botToken}/answerPreCheckoutQuery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pre_checkout_query_id: query.id,
            ok: false,
            error_message: "Sorry, there was an error processing your payment."
          })
        });
      } catch (e) {
        await this.logger.error(`Failed to reject payment: ${e.message}`);
      }
      
      return false;
    }
  }
}
