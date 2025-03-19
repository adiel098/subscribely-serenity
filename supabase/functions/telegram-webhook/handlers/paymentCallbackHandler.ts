
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createLogger } from '../services/loggingService.ts';
import { PreCheckoutService } from '../services/preCheckoutService.ts';
import { PaymentSuccessService } from '../services/paymentSuccessService.ts';

/**
 * Handles payment callbacks from Telegram
 * @param supabase Supabase client
 * @param update The payment data from Telegram
 */
export async function handlePaymentCallback(
  supabase: ReturnType<typeof createClient>,
  update: any
) {
  const logger = createLogger(supabase, 'PAYMENT-CALLBACK-HANDLER');
  
  try {
    await logger.info(`Processing payment callback: ${JSON.stringify(update).substring(0, 200)}...`);
    
    if (!update.pre_checkout_query && !update.successful_payment) {
      await logger.warn('Received payment callback without pre_checkout_query or successful_payment');
      return false;
    }
    
    // Handle pre checkout query
    if (update.pre_checkout_query) {
      const preCheckoutService = new PreCheckoutService(supabase);
      return await preCheckoutService.handlePreCheckoutQuery(update.pre_checkout_query);
    }
    
    // Handle successful payment
    if (update.message?.successful_payment) {
      const paymentSuccessService = new PaymentSuccessService(supabase);
      return await paymentSuccessService.handleSuccessfulPayment(update.message);
    }
    
    return false;
  } catch (error) {
    await logger.error(`Error processing payment callback: ${error.message}`);
    return false;
  }
}
