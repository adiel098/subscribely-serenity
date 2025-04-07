
import { useState } from "react";
import { useMembershipUpdate } from "../useMembershipUpdate";
import { createPaymentToast, generateDemoPaymentId, validateAndLogPayment } from "./paymentUtils";
import { useFetchPlanDetails } from "./useFetchPlanDetails";
import { logPaymentAction } from "../utils";
import { NOWPaymentsClient } from "@/integrations/nowpayments/client";
import { supabase } from "@/integrations/supabase/client";

interface PaymentHandlerOptions {
  telegramUserId?: string;
  telegramUsername?: string;
  communityId: string;
  planId: string;
  onSuccess?: () => void;
}

/**
 * Hook for handling the payment process
 */
export const usePaymentHandler = ({
  telegramUserId,
  telegramUsername,
  communityId,
  planId,
  onSuccess
}: PaymentHandlerOptions) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nowPaymentsData, setNowPaymentsData] = useState<any>(null);
  
  // Use the membership update hook
  const { updateMembershipStatus } = useMembershipUpdate();
  const { fetchPlanDetails } = useFetchPlanDetails();
  
  /**
   * Get NOWPayments API key from the database
   */
  const getNOWPaymentsConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('config')
        .eq('provider', 'crypto')
        .eq('is_active', true)
        .maybeSingle();
        
      if (error) throw error;
      return data?.config || null;
    } catch (err) {
      console.error("Error fetching NOWPayments config:", err);
      return null;
    }
  };
  
  /**
   * Process NOWPayments payment
   */
  const processNOWPaymentsPayment = async (planDetails: any) => {
    const config = await getNOWPaymentsConfig();
    if (!config?.api_key) {
      throw new Error("NOWPayments API key not configured");
    }
    
    const client = new NOWPaymentsClient(config.api_key);
    const payment = await client.createPayment({
      priceAmount: planDetails.price,
      priceCurrency: "USD",
      orderId: `telegram-${communityId}-${telegramUserId}-${Date.now()}`,
      orderDescription: `Telegram Group Subscription - ${planDetails.name}`,
      ipnCallbackUrl: config.ipn_callback_url
    });
    
    setNowPaymentsData(payment);
    
    // Store payment data for later retrieval
    localStorage.setItem('nowpayments_transaction', JSON.stringify({
      paymentId: payment.payment_id,
      status: payment.payment_status,
      amount: payment.price_amount,
      timestamp: Date.now()
    }));
    
    // Open payment page
    if (payment.payment_url) {
      window.open(payment.payment_url, '_blank');
    }
    
    return payment;
  };

  /**
   * Executes the final step of the payment process by updating membership status
   */
  const finalizePayment = async (
    paymentId: string,
    inviteLink: string | null,
    planDetails: any
  ) => {
    console.log(`[usePaymentHandler] Finalizing payment by updating membership status IMMEDIATELY after payment.`);
    
    console.log('[usePaymentHandler] Updating membership with params:', {
      telegramUserId: telegramUserId!,
      communityId,
      planId,
      paymentId,
      username: telegramUsername,
      planDetails
    });
    
    // Update membership status - THIS WILL IMMEDIATELY CREATE A MEMBER RECORD WITH SUBSCRIPTION DETAILS
    const membershipUpdated = await updateMembershipStatus({
      telegramUserId: telegramUserId!,
      communityId,
      planId,
      paymentId,
      username: telegramUsername,
      planDetails
    });

    if (!membershipUpdated) {
      console.error(`[usePaymentHandler] Membership update failed.`);
      throw new Error("Failed to update membership status");
    }

    console.log(`[usePaymentHandler] Membership updated successfully with subscription details.`);
    logPaymentAction('Payment processing completed successfully', { inviteLink });
    
    // Call success callback if provided
    onSuccess?.();
    
    return true;
  };
  
  /**
   * Process a payment with the specified payment method
   */
  const processPaymentWithMethod = async (
    paymentMethod: string, 
    recordPayment: Function,
    inviteLink: string | null,
    fetchOrCreateInviteLink: Function
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('[usePaymentHandler] Starting payment processing');
      
      // Validate all required parameters
      const validation = validateAndLogPayment(telegramUserId, communityId, planId, paymentMethod);
      if (!validation.isValid) {
        setError(validation.error);
        return false;
      }
      
      // Generate payment ID for demo purposes or non-nowpayments methods
      const paymentId = generateDemoPaymentId();
      
      // Always generate a new invite link for new payments
      logPaymentAction('Generating fresh invite link for this payment');
      console.log(`[usePaymentHandler] Generating invite link for community: ${communityId}`);
      const currentInviteLink = await fetchOrCreateInviteLink(communityId, true);
      
      if (!currentInviteLink) {
        console.warn('[usePaymentHandler] Could not generate a fresh invite link, will try to use existing one');
      } else {
        console.log(`[usePaymentHandler] Generated invite link: ${currentInviteLink}`);
      }
      
      // Use the new or existing invite link
      const linkToUse = currentInviteLink || inviteLink;
      console.log(`[usePaymentHandler] Using invite link: ${linkToUse}`);
      
      // Fetch plan details for subscription dates calculation
      const planDetails = await fetchPlanDetails(planId);
      
      // Handle NOWPayments specifically
      let nowPaymentsPaymentId = null;
      if (paymentMethod === 'nowpayments') {
        try {
          const nowPayment = await processNOWPaymentsPayment(planDetails);
          nowPaymentsPaymentId = nowPayment.payment_id;
          console.log('[usePaymentHandler] NOWPayments payment initiated:', nowPayment);
          
          // NOWPayments requires special handling as it redirects the user away
          // We'll record the payment but not finalize it yet
          const { success: paymentRecorded, paymentData } = await recordPayment({
            telegramUserId: telegramUserId!,
            communityId,
            planId,
            amount: planDetails?.price || 0,
            paymentMethod: 'crypto', // Use 'crypto' as the internal provider name
            inviteLink: linkToUse,
            username: telegramUsername,
            metadata: {
              nowpayments: {
                payment_id: nowPayment.payment_id,
                payment_status: nowPayment.payment_status,
                payment_url: nowPayment.payment_url
              }
            }
          });
          
          if (!paymentRecorded) {
            throw new Error("Failed to record NOWPayments payment");
          }
          
          // For NOWPayments, we return early since the user needs to complete payment on the external site
          // The payment will be finalized when they return or via IPN callback
          return true;
        } catch (err) {
          console.error('[usePaymentHandler] NOWPayments payment error:', err);
          throw err;
        }
      }
      
      // For other payment methods, continue with normal flow
      // Record the payment
      const { success: paymentRecorded, inviteLink: updatedInviteLink, error: paymentError } = await recordPayment({
        telegramUserId: telegramUserId!,
        communityId,
        planId,
        amount: planDetails?.price || 0,
        paymentMethod,
        inviteLink: linkToUse,
        username: telegramUsername
      });

      if (!paymentRecorded) {
        console.error(`[usePaymentHandler] Payment recording failed: ${paymentError}`);
        throw new Error(paymentError || "Failed to record payment");
      }

      console.log(`[usePaymentHandler] Payment recorded successfully.`);
      
      // Finalize the payment by updating membership status
      return await finalizePayment(paymentId, updatedInviteLink || linkToUse, planDetails);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Payment processing failed";
      console.error("[usePaymentHandler] Payment processing error:", errorMessage);
      console.error("[usePaymentHandler] Full error details:", err);
      setError(errorMessage);
      createPaymentToast(false, null, errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    processPaymentWithMethod,
    isLoading,
    error,
    setError,
    nowPaymentsData
  };
};
