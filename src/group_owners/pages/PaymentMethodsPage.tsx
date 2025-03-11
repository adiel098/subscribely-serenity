
import React, { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { CreditCard, Filter, Info } from "lucide-react";
import { useCommunityContext } from "@/contexts/CommunityContext";
import { useAvailablePaymentMethods } from "@/group_owners/hooks/usePaymentMethods";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PaymentMethodCard } from "@/group_owners/components/payments/PaymentMethodCard";
import { EmptyState } from "@/components/ui/empty-state";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { PAYMENT_METHOD_ICONS, PAYMENT_METHOD_IMAGES } from "@/group_owners/data/paymentMethodsData";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { PaymentMethod } from "@/group_owners/hooks/types/subscription.types";

export const PaymentMethodsPage = () => {
  const { selectedCommunityId } = useCommunityContext();
  const { data: paymentMethods, isLoading, refetch } = useAvailablePaymentMethods(selectedCommunityId);
  const [filter, setFilter] = useState<string>("all"); // all, community, default

  const handleTogglePaymentMethod = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('payment_methods')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;

      refetch();
      toast({
        title: "Success",
        description: "Payment method status updated successfully",
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
      const { error } = await supabase
        .from('payment_methods')
        .update({ is_default: isDefault })
        .eq('id', id);

      if (error) throw error;

      refetch();
      
      if (isDefault) {
        toast({
          title: "Success",
          description: "Payment method set as default for all your communities",
        });
      } else {
        toast({
          title: "Success",
          description: "Payment method is no longer a default",
        });
      }
    } catch (error) {
      console.error("Failed to toggle default status", error);
      toast({
        title: "Error",
        description: "Failed to update payment method status",
        variant: "destructive",
      });
    }
  };

  // Filter payment methods based on the selected filter
  const filteredPaymentMethods = paymentMethods?.filter((method: PaymentMethod) => {
    if (filter === "all") return true;
    if (filter === "community") return method.community_id === selectedCommunityId;
    if (filter === "default") return method.is_default;
    return true;
  });

  const isPaymentMethodConfigured = (method: PaymentMethod) => {
    return method.config && Object.keys(method.config).length > 0;
  };

  return (
    <div className="container py-8">
      <PageHeader
        title="Payment Methods"
        description="Configure and manage payment methods for your community"
        icon={<CreditCard className="w-8 h-8 text-indigo-600" />}
      />

      <div className="mb-6 mt-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Filter className="h-5 w-5 text-gray-500" />
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[200px] border-indigo-100 bg-white">
              <SelectValue placeholder="Filter payment methods" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All payment methods</SelectItem>
                <SelectItem value="community">Specific to this community</SelectItem>
                <SelectItem value="default">Default payment methods</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Info card explaining payment methods sharing */}
      <Card className="bg-blue-50 border-blue-200 mb-8">
        <CardContent className="pt-6 pb-5">
          <div className="flex gap-3">
            <div className="bg-blue-100 text-blue-700 p-2 rounded-full h-fit">
              <Info className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-medium text-blue-800 mb-1">
                Sharing payment methods between communities
              </h3>
              <p className="text-sm text-blue-600">
                Payment methods set as "default" will be available in all your communities.
                Mark a payment method as default to save time and avoid reconfiguring in each community.
                Default payment methods are marked with a star icon.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((_, i) => (
            <Card key={i} className="h-80">
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-10 w-full mt-auto" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredPaymentMethods && filteredPaymentMethods.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {filteredPaymentMethods.map((method: PaymentMethod) => {
            const Icon = PAYMENT_METHOD_ICONS[method.provider] || CreditCard;
            const imageSrc = PAYMENT_METHOD_IMAGES[method.provider];
            
            return (
              <PaymentMethodCard
                key={method.id}
                icon={Icon}
                title={
                  method.provider === 'stripe' ? 'Stripe' : 
                  method.provider === 'paypal' ? 'PayPal' : 
                  method.provider === 'crypto' ? 'Crypto' : 
                  method.provider
                }
                description={
                  method.provider === 'stripe' ? 'Accept payments with credit cards' : 
                  method.provider === 'paypal' ? 'Accept payments with PayPal' : 
                  method.provider === 'crypto' ? 'Accept payments with cryptocurrencies' : 
                  'Payment method'
                }
                isActive={method.is_active || false}
                onToggle={(active) => handleTogglePaymentMethod(method.id, active)}
                isConfigured={isPaymentMethodConfigured(method)}
                onConfigure={() => {}}
                imageSrc={imageSrc}
                provider={method.provider}
                communityId={method.community_id}
                isDefault={method.is_default || false}
                onDefaultToggle={
                  // Only allow default toggle for methods specific to this community
                  method.community_id === selectedCommunityId 
                    ? (value) => handleToggleDefault(method.id, value) 
                    : undefined
                }
              />
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<CreditCard className="h-10 w-10 text-indigo-500" />}
          title="No payment methods available"
          description={
            filter !== "all" 
              ? "Change the filter to see more payment methods"
              : "To complete your community setup, you need to configure at least one payment method"
          }
          action={
            filter !== "all" ? (
              <button
                onClick={() => setFilter("all")}
                className={cn(
                  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors",
                  "bg-indigo-50 text-indigo-700 shadow-sm hover:bg-indigo-100",
                  "h-9 px-4 py-2"
                )}
              >
                Show all payment methods
              </button>
            ) : null
          }
        />
      )}
    </div>
  );
};
