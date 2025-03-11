
import React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { CreditCard } from "lucide-react";
import { PaymentMethodsInfo } from "@/group_owners/components/payment-methods/PaymentMethodsInfo";
import { PaymentMethodFilters } from "@/group_owners/components/payment-methods/PaymentMethodFilters";
import { PaymentMethodsGrid } from "@/group_owners/components/payment-methods/PaymentMethodsGrid";
import { usePaymentMethodsPage } from "@/group_owners/hooks/usePaymentMethodsPage";

export const PaymentMethodsPage = () => {
  const {
    selectedCommunityId,
    paymentMethods,
    isLoading,
    filter,
    setFilter,
    handleTogglePaymentMethod,
    handleToggleDefault,
  } = usePaymentMethodsPage();

  return (
    <div className="container py-8">
      <PageHeader
        title="Payment Methods"
        description="Configure and manage payment methods for your community"
        icon={<CreditCard className="w-8 h-8 text-indigo-600" />}
      />

      <div className="mb-6 mt-8 flex items-center justify-between">
        <PaymentMethodFilters
          filter={filter}
          onFilterChange={setFilter}
        />
      </div>

      <PaymentMethodsInfo />

      <PaymentMethodsGrid
        paymentMethods={paymentMethods}
        isLoading={isLoading}
        filter={filter}
        selectedCommunityId={selectedCommunityId}
        onTogglePaymentMethod={handleTogglePaymentMethod}
        onToggleDefault={handleToggleDefault}
      />
    </div>
  );
};
