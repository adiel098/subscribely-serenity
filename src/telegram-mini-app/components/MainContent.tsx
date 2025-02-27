
import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Community, Plan } from "@/telegram-mini-app/types/community.types";
import { CommunityHeader } from "@/telegram-mini-app/components/CommunityHeader";
import { SubscriptionPlans } from "@/telegram-mini-app/components/SubscriptionPlans";
import { PaymentMethods } from "@/telegram-mini-app/components/PaymentMethods";

interface MainContentProps {
  community: Community;
}

export const MainContent: React.FC<MainContentProps> = ({ community }) => {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handlePaymentMethodSelect = (method: string) => {
    setSelectedPaymentMethod(method);
    console.log(`Selected payment method: ${method}`);
  };

  const handleCompletePurchase = () => {
    setShowSuccess(true);
  };

  const handlePlanSelect = (plan: Plan) => {
    setSelectedPlan(plan);
    document.getElementById('payment-methods')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <ScrollArea className="h-[100vh] w-full">
      <div className="min-h-screen bg-gradient-to-b from-primary/10 via-background to-primary/5">
        <div className="container max-w-2xl mx-auto pt-8 px-4 space-y-12">
          <CommunityHeader community={community} />

          <SubscriptionPlans
            plans={community.subscription_plans}
            selectedPlan={selectedPlan}
            onPlanSelect={handlePlanSelect}
          />

          {selectedPlan && (
            <PaymentMethods
              selectedPlan={selectedPlan}
              selectedPaymentMethod={selectedPaymentMethod}
              onPaymentMethodSelect={handlePaymentMethodSelect}
              onCompletePurchase={handleCompletePurchase}
              communityInviteLink={community.telegram_invite_link}
              showSuccess={showSuccess}
            />
          )}

          {!selectedPlan && (
            <div className="flex justify-center py-8 animate-bounce">
              <ChevronDown className="h-6 w-6 text-primary/50" />
            </div>
          )}
        </div>
      </div>
    </ScrollArea>
  );
};
