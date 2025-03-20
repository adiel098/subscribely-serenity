
/**
 * Utility functions for managing payment state
 */

/**
 * Reset the payment processing state
 */
export const resetPaymentState = (setIsLoading: (value: boolean) => void, 
                                 setIsSuccess: (value: boolean) => void, 
                                 setError: (value: string | null) => void) => {
  setIsLoading(false);
  setIsSuccess(false);
  setError(null);
};

/**
 * Set payment state to loading state
 */
export const setPaymentLoadingState = (setIsLoading: (value: boolean) => void, 
                                      setError: (value: string | null) => void,
                                      onStart?: () => void) => {
  setIsLoading(true);
  setError(null);
  
  if (onStart) {
    onStart();
  }
};

/**
 * Set payment state to success state
 */
export const setPaymentSuccessState = (setIsLoading: (value: boolean) => void, 
                                      setIsSuccess: (value: boolean) => void,
                                      onSuccess?: () => void) => {
  setIsLoading(false);
  setIsSuccess(true);
  
  if (onSuccess) {
    console.log("[PaymentStateUtils] Calling onSuccess callback");
    onSuccess();
  }
};

/**
 * Set payment state to error state
 */
export const setPaymentErrorState = (setIsLoading: (value: boolean) => void, 
                                    setError: (value: string | null) => void,
                                    errorMessage: string,
                                    onError?: (error: string) => void) => {
  setIsLoading(false);
  setError(errorMessage);
  
  if (onError) {
    onError(errorMessage);
  }
};
