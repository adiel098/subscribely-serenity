import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface PaymentMethodCredentials {
  api_key: string;
  api_secret: string;
  is_sandbox: boolean;
  webhook_url?: string;
  additional_settings?: Record<string, any>;
}

interface UpdatePaymentMethodParams {
  provider_id: string;
  credentials: PaymentMethodCredentials;
}

export const usePaymentMethodUpdate = () => {
  const { toast } = useToast();
  let authData = { user: null };
  
  try {
    authData = useAuth();
  } catch (error) {
    console.warn("Auth provider not available, continuing with null user");
  }
  
  const { user } = authData;
  const queryClient = useQueryClient();

  const updatePaymentMethod = async ({ provider_id, credentials }: UpdatePaymentMethodParams) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      // Check if a payment method entry exists for this provider and owner
      const { data: existingMethod, error: fetchError } = await supabase
        .from('owner_payment_methods')
        .select('id')
        .eq('provider', provider_id)
        .eq('owner_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw new Error(fetchError.message);
      }

      let result;

      if (existingMethod) {
        // Update existing payment method
        const { data, error } = await supabase
          .from('owner_payment_methods')
          .update({
            config: credentials,
            is_active: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingMethod.id)
          .select()
          .single();

        if (error) throw new Error(error.message);
        result = data;
      } else {
        // Create new payment method
        const { data, error } = await supabase
          .from('owner_payment_methods')
          .insert({
            provider: provider_id,
            owner_id: user.id,
            config: credentials,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw new Error(error.message);
        result = data;
      }

      return result;
    } catch (error: any) {
      console.error('Failed to update payment method:', error);
      throw error;
    }
  };

  const mutation = useMutation({
    mutationFn: updatePaymentMethod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentMethods'] });
      toast({
        title: "Success",
        description: "Payment method configured successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to configure payment method: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  return {
    updatePaymentMethod: mutation.mutate,
    updatePaymentMethodAsync: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    error: mutation.error,
  };
};
