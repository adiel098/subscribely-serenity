
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PlatformPaymentMethod {
  id: string;
  provider: string;
  is_active: boolean;
  config: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export const usePlatformPaymentMethods = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['platform-payment-methods'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_payment_methods')
        .select('*');
        
      if (error) throw error;
      return data as PlatformPaymentMethod[];
    }
  });

  const updatePaymentMethod = useMutation({
    mutationFn: async ({ 
      provider, 
      isActive, 
      config 
    }: {
      provider: string;
      isActive: boolean;
      config: Record<string, any>;
    }) => {
      const existingMethod = data?.find(m => m.provider === provider);

      if (existingMethod) {
        // Update existing method
        const { data: updatedMethod, error } = await supabase
          .from('platform_payment_methods')
          .update({ 
            is_active: isActive,
            config
          })
          .eq('provider', provider)
          .select()
          .single();

        if (error) throw error;
        return updatedMethod;
      } else {
        // Create new method
        const { data: newMethod, error } = await supabase
          .from('platform_payment_methods')
          .insert({ 
            provider,
            is_active: isActive,
            config
          })
          .select()
          .single();

        if (error) throw error;
        return newMethod;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-payment-methods'] });
    }
  });

  return {
    paymentMethods: data || [],
    isLoading,
    error,
    updatePaymentMethod
  };
};
