
import { useState } from 'react';
import { usePaymentRecord } from './usePaymentRecord';
import { useTelegramUser } from '../useTelegramUser';
import { toast } from '@/components/ui/use-toast';
import { createOrUpdateMember } from '@/telegram-mini-app/services/memberService';

interface PaymentProcessingProps {
  communityId: string;
  planId: string;
  planPrice: number;
  communityInviteLink?: string | null;
  telegramUserId?: string;
  telegramUsername?: string;
  firstName?: string;
  lastName?: string;
  onSuccess?: () => void;
}

export const usePaymentProcessing = ({
  communityId,
  planId,
  planPrice,
  communityInviteLink,
  telegramUserId,
  telegramUsername,
  firstName,
  lastName,
  onSuccess
}: PaymentProcessingProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  
  const { recordPayment } = usePaymentRecord();
  const { user: telegramUser } = useTelegramUser();
  
  // Get user information either from props or from the Telegram Web App
  const userId = telegramUserId || telegramUser?.id;
  const username = telegramUsername || telegramUser?.username;
  const userFirstName = firstName || telegramUser?.first_name;
  const userLastName = lastName || telegramUser?.last_name;
  
  const processPayment = async (paymentMethod: string) => {
    console.log('[usePaymentProcessing] Processing payment...');
    console.log('[usePaymentProcessing] Payment method:', paymentMethod);
    console.log('[usePaymentProcessing] Plan ID:', planId);
    console.log('[usePaymentProcessing] Plan price:', planPrice);
    console.log('[usePaymentProcessing] Community ID:', communityId);
    console.log('[usePaymentProcessing] Invite link:', communityInviteLink);
    console.log('[usePaymentProcessing] User ID:', userId);
    console.log('[usePaymentProcessing] Username:', username);
    console.log('[usePaymentProcessing] First name:', userFirstName);
    console.log('[usePaymentProcessing] Last name:', userLastName);
    
    if (!userId) {
      const errorMsg = 'User ID is required for payment processing.';
      console.error(`[usePaymentProcessing] ${errorMsg}`);
      setError(errorMsg);
      toast({
        title: "Payment Error",
        description: errorMsg,
        variant: "destructive",
      });
      return;
    }
    
    if (!communityId) {
      const errorMsg = 'Community ID is required for payment processing.';
      console.error(`[usePaymentProcessing] ${errorMsg}`);
      setError(errorMsg);
      toast({
        title: "Payment Error",
        description: errorMsg,
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('[usePaymentProcessing] Recording payment...');
      
      // For development/testing, simplify by always succeeding
      if (process.env.NODE_ENV === 'development' && import.meta.env.VITE_TEST_PAYMENTS === 'true') {
        console.log('[usePaymentProcessing] TEST MODE: Simulating successful payment');
        
        setTimeout(() => {
          setIsLoading(false);
          setIsSuccess(true);
          setInviteLink(communityInviteLink);
          
          if (onSuccess) {
            onSuccess();
          }
          
          toast({
            title: "Payment Successful",
            description: "Your payment was processed successfully!",
          });
        }, 1500);
        
        return;
      }
      
      // Real payment processing
      const result = await recordPayment({
        telegramUserId: userId,
        communityId,
        planId,
        planPrice,
        paymentMethod,
        inviteLink: communityInviteLink || null,
        username,
        firstName: userFirstName,
        lastName: userLastName
      });
      
      console.log('[usePaymentProcessing] Payment result:', result);
      
      if (result.success) {
        setIsSuccess(true);
        setInviteLink(result.inviteLink);
        
        // Create or update member record immediately after successful payment
        console.log('[usePaymentProcessing] Creating member record...');
        
        try {
          // Calculate subscription dates
          const startDate = new Date();
          let endDate = new Date(startDate);
          
          // Add appropriate time based on plan interval (can be improved with plan data)
          endDate.setMonth(endDate.getMonth() + 1); // Default to 1 month

          await createOrUpdateMember({
            telegram_id: userId,
            community_id: communityId,
            subscription_plan_id: planId,
            status: 'active',
            payment_id: result.paymentData?.id,
            username: username,
            subscription_start_date: startDate.toISOString(),
            subscription_end_date: endDate.toISOString()
          });
          
          console.log('[usePaymentProcessing] Member record created successfully');
        } catch (memberErr) {
          console.error('[usePaymentProcessing] Error creating member record:', memberErr);
          // Continue despite this error, as the payment was successful
        }
        
        if (onSuccess) {
          onSuccess();
        }
        
        toast({
          title: "Payment Successful",
          description: "Your payment was processed successfully!",
        });
      } else {
        throw new Error(result.error || 'Payment processing failed');
      }
    } catch (err) {
      console.error('[usePaymentProcessing] Error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      
      toast({
        title: "Payment Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetState = () => {
    setIsLoading(false);
    setIsSuccess(false);
    setError(null);
    setInviteLink(null);
  };
  
  return {
    processPayment,
    isLoading,
    isSuccess,
    error,
    inviteLink,
    resetState
  };
};
