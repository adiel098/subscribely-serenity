
import React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { CreditCard } from "lucide-react";
import { PaymentMethodsInfo } from "@/group_owners/components/payment-methods/PaymentMethodsInfo";
import { PaymentMethodsGrid } from "@/group_owners/components/payment-methods/PaymentMethodsGrid";
import { usePaymentMethods } from "@/group_owners/hooks/usePaymentMethods";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export const PaymentMethodsPage = () => {
  const { user } = useAuth();
  const { data: paymentMethods, isLoading, refetch } = usePaymentMethods();

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

  return (
    <div className="container py-8">
      <PageHeader
        title="Payment Methods"
        description="Configure and manage payment methods for all your communities"
        icon={<CreditCard className="w-8 h-8 text-indigo-600" />}
      />

      <div className="mb-6 mt-8">
        <PaymentMethodsInfo />
      </div>

      <PaymentMethodsGrid
        paymentMethods={paymentMethods}
        isLoading={isLoading}
        userId={user?.id}
        onTogglePaymentMethod={handleTogglePaymentMethod}
      />
    </div>
  );
};
