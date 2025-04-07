
import { useState, useEffect } from "react";
import { useCommunityContext } from "@/contexts/CommunityContext";
import { usePaymentMethods } from "@/group_owners/hooks/usePaymentMethods";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { PaymentMethod } from "@/group_owners/hooks/types/subscription.types";
import { useAuth } from "@/auth/contexts/AuthContext";

export const usePaymentMethodsPage = () => {
  const { selectedCommunityId } = useCommunityContext();
  const { user } = useAuth();
  const { data: paymentMethods, isLoading, refetch } = usePaymentMethods();
  const [filter, setFilter] = useState<string>("all");
  const [isInitializing, setIsInitializing] = useState(true);

  // Create default payment methods if none exist
  useEffect(() => {
    const createDefaultPaymentMethods = async () => {
      if (!user?.id || isLoading || (paymentMethods && paymentMethods.length > 0)) {
        setIsInitializing(false);
        return;
      }

      try {
        console.log("Creating default payment methods for user:", user.id);
        
        // Create default payment methods (stripe, paypal, nowpayments)
        const defaultMethods = [
          { provider: 'stripe', is_active: false, config: {}, owner_id: user.id },
          { provider: 'paypal', is_active: false, config: {}, owner_id: user.id },
          { provider: 'nowpayments', is_active: false, config: {}, owner_id: user.id }
        ];

        const { error } = await supabase
          .from('payment_methods')
          .insert(defaultMethods);

        if (error) {
          console.error("Error creating default payment methods:", error);
          throw error;
        }

        await refetch();
        console.log("Default payment methods created successfully");
      } catch (error) {
        console.error("Failed to create default payment methods", error);
      } finally {
        setIsInitializing(false);
      }
    };

    createDefaultPaymentMethods();
  }, [user?.id, paymentMethods, isLoading, refetch]);

  const handleTogglePaymentMethod = async (id: string, isActive: boolean) => {
    try {
      console.log(`Toggling payment method ${id} to ${isActive}`);
      
      const { error } = await supabase
        .from('payment_methods')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) {
        console.error("Error toggling payment method:", error);
        throw error;
      }

      await refetch();
      
      toast({
        title: "Success",
        description: `Payment method ${isActive ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (error) {
      console.error("Failed to toggle payment method", error);
      toast({
        title: "Error",
        description: "Failed to update payment method status",
        variant: "destructive",
      });
    }
  };

  const filteredPaymentMethods = paymentMethods?.filter((method: PaymentMethod) => {
    if (filter === "all") return true;
    return true;
  });

  console.log("Filtered payment methods:", filteredPaymentMethods);

  return {
    selectedCommunityId,
    paymentMethods: filteredPaymentMethods,
    isLoading: isLoading || isInitializing,
    filter,
    setFilter,
    handleTogglePaymentMethod,
  };
};
