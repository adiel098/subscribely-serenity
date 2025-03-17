
import { useState } from "react";
import { createPayment } from "../../services/paymentService";
import { PaymentData } from "../../types/payment.types";

export interface RecordPaymentParams {
  telegramUserId?: string;
  communityId: string;
  planId: string;
  amount: number;
  paymentMethod: string;
  inviteLink?: string | null;
  username?: string;
  firstName?: string;
  lastName?: string;
  activeSubscription?: any;
  interval?: string; // Keep this property to support interval information
}

export const usePaymentRecord = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recordPayment = async ({
    telegramUserId,
    communityId,
    planId,
    amount,
    paymentMethod,
    inviteLink,
    username,
    firstName,
    lastName,
    interval
  }: RecordPaymentParams) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log(`[usePaymentRecord] Recording payment for plan ${planId} with interval ${interval || 'unknown'}`);
      const payment = await createPayment({
        plan_id: planId,
        community_id: communityId,
        amount: amount,
        payment_method: paymentMethod,
        status: 'completed',
        invite_link: inviteLink || '',
        telegram_user_id: telegramUserId,
        telegram_username: username, // Now this property is correctly defined in PaymentData
        first_name: firstName,
        last_name: lastName
      });

      console.log('[usePaymentRecord] Payment recorded successfully:', payment);
      return { 
        success: true, 
        paymentData: payment, 
        inviteLink: payment?.invite_link || inviteLink 
      };
    } catch (err) {
      console.error('[usePaymentRecord] Error recording payment:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return { 
        success: false, 
        error: errorMessage,
        paymentData: null,
        inviteLink: null 
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    recordPayment,
    isLoading,
    error
  };
};
