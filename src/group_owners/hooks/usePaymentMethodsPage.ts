
import { useState } from "react";
import { useCommunityContext } from "@/contexts/CommunityContext";
import { usePaymentMethods } from "@/group_owners/hooks/usePaymentMethods";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { PaymentMethod } from "@/group_owners/hooks/types/subscription.types";

export const usePaymentMethodsPage = () => {
  const { selectedCommunityId } = useCommunityContext();
  const { data: paymentMethods, isLoading, refetch } = usePaymentMethods();
  const [filter, setFilter] = useState<string>("all");

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
    isLoading,
    filter,
    setFilter,
    handleTogglePaymentMethod,
  };
};
