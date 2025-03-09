
import { logPaymentAction, validatePaymentParams } from "../utils";
import { toast } from "@/components/ui/use-toast";

/**
 * Creates a toast notification for payment status
 */
export const createPaymentToast = (
  isSuccess: boolean,
  inviteLink: string | null,
  errorMessage?: string
) => {
  if (isSuccess) {
    toast({
      title: "Payment Successful",
      description: inviteLink 
        ? "Thank you for your payment. You can now join the community." 
        : "Payment successful, but no invite link is available. Please contact support.",
    });
  } else if (errorMessage) {
    toast({
      title: "Payment Error",
      description: errorMessage,
      variant: "destructive",
    });
  }
};

/**
 * Validates payment parameters and returns a result
 */
export const validateAndLogPayment = (
  telegramUserId: string | undefined,
  communityId: string,
  planId: string,
  paymentMethod: string
) => {
  // Log payment parameters
  console.log(`[PaymentUtils] Validating payment parameters:
    - communityId: ${communityId}, type: ${typeof communityId}
    - planId: ${planId}, type: ${typeof planId}
    - telegramUserId: ${telegramUserId}, type: ${typeof telegramUserId}
    - paymentMethod: ${paymentMethod}, type: ${typeof paymentMethod}
  `);
  
  // Validate required parameters
  const validation = validatePaymentParams(telegramUserId, communityId, planId);
  
  if (validation.isValid) {
    logPaymentAction(`Processing payment for plan ${planId}`, { 
      paymentMethod,
      communityId,
      telegramUserId
    });
  } else {
    console.error(`[PaymentUtils] Validation failed: ${validation.error}`);
  }
  
  return validation;
};

/**
 * Generates a demo payment ID for testing
 */
export const generateDemoPaymentId = () => {
  const paymentId = `demo-${Date.now()}`;
  console.log(`[PaymentUtils] Generated payment ID: ${paymentId}`);
  return paymentId;
};
