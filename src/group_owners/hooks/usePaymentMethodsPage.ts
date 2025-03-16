
import { useState } from "react";
import { useCommunityContext } from "@/contexts/CommunityContext";
import { useAvailablePaymentMethods } from "@/group_owners/hooks/usePaymentMethods";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { PaymentMethod } from "@/group_owners/hooks/types/subscription.types";

export const usePaymentMethodsPage = () => {
  const { selectedCommunityId } = useCommunityContext();
  const { data: paymentMethods, isLoading, refetch } = useAvailablePaymentMethods(selectedCommunityId);
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

  const handleToggleDefault = async (id: string, isDefault: boolean) => {
    try {
      console.log(`Setting payment method ${id} default status to ${isDefault}`);
      
      const { error } = await supabase
        .from('payment_methods')
        .update({ is_default: isDefault })
        .eq('id', id);

      if (error) {
        console.error("Error toggling default status:", error);
        throw error;
      }

      await refetch();
      
      toast({
        title: "Success",
        description: isDefault 
          ? "Payment method set as default for all your communities"
          : "Payment method is no longer a default",
      });
    } catch (error) {
      console.error("Failed to toggle default status", error);
      toast({
        title: "Error",
        description: "Failed to update payment method default status",
        variant: "destructive",
      });
    }
  };

  const filteredPaymentMethods = paymentMethods?.filter((method: PaymentMethod) => {
    if (filter === "all") return true;
    if (filter === "community") return method.community_id === selectedCommunityId;
    if (filter === "default") return method.is_default;
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
    handleToggleDefault,
  };
};
