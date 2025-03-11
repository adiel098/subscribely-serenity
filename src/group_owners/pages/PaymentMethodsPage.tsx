
import React, { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { CreditCard, Filter, Info, Mail } from "lucide-react";
import { useCommunityContext } from "@/contexts/CommunityContext";
import { usePaymentMethods, useAvailablePaymentMethods } from "@/group_owners/hooks/usePaymentMethods";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PaymentMethodCard } from "@/group_owners/components/payments/PaymentMethodCard";
import { EmptyState } from "@/components/ui/empty-state";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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
      toast.success("סטטוס אמצעי התשלום עודכן בהצלחה");
    } catch (error) {
      console.error("Failed to toggle payment method", error);
      toast.error("אירעה שגיאה בעדכון אמצעי התשלום");
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
        toast.success("אמצעי התשלום הוגדר כברירת מחדל לכל הקהילות שלך");
      } else {
        toast.success("אמצעי התשלום אינו משמש עוד כברירת מחדל");
      }
    } catch (error) {
      console.error("Failed to toggle default status", error);
      toast.error("אירעה שגיאה בעדכון אמצעי התשלום");
    }
  };

  // Filter payment methods based on the selected filter
  const filteredPaymentMethods = paymentMethods?.filter(method => {
    if (filter === "all") return true;
    if (filter === "community") return method.community_id === selectedCommunityId;
    if (filter === "default") return method.is_default;
    return true;
  });

  const isPaymentMethodConfigured = (method: any) => {
    return method.config && Object.keys(method.config).length > 0;
  };

  return (
    <div className="container py-8">
      <PageHeader
        title="אמצעי תשלום"
        description="הגדרת וניהול שיטות תשלום עבור הקהילה שלך"
        icon={<CreditCard className="w-8 h-8 text-indigo-600" />}
      />

      <div className="mb-6 mt-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Filter className="h-5 w-5 text-gray-500" />
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[200px] border-indigo-100 bg-white">
              <SelectValue placeholder="סנן אמצעי תשלום" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">כל אמצעי התשלום</SelectItem>
                <SelectItem value="community">ייחודיים לקהילה זו</SelectItem>
                <SelectItem value="default">אמצעי תשלום ברירת מחדל</SelectItem>
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
                שיתוף אמצעי תשלום בין קהילות
              </h3>
              <p className="text-sm text-blue-600">
                אמצעי תשלום שמוגדרים כ"ברירת מחדל" יהיו זמינים בכל הקהילות שלך. 
                סמן אמצעי תשלום כברירת מחדל כדי לחסוך זמן ולא להגדיר מחדש בכל קהילה. 
                אמצעי תשלום מסומנים בפינה עם סימון כוכב.
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
          {filteredPaymentMethods.map((method) => {
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
                  method.provider === 'stripe' ? 'קבל תשלומים באמצעות כרטיסי אשראי' : 
                  method.provider === 'paypal' ? 'קבל תשלומים באמצעות פייפאל' : 
                  method.provider === 'crypto' ? 'קבל תשלומים במטבעות קריפטו' : 
                  'אמצעי תשלום'
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
          title="אין אמצעי תשלום זמינים"
          description={
            filter !== "all" 
              ? "שנה את הסינון כדי לראות אמצעי תשלום נוספים"
              : "להשלמת הגדרת הקהילה, נדרש להגדיר לפחות אמצעי תשלום אחד"
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
                הצג את כל אמצעי התשלום
              </button>
            ) : null
          }
        />
      )}
    </div>
  );
};
