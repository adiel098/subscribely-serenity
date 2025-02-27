
import React from "react";
import { CommunityHeader } from "./CommunityHeader";
import { PlanSelectionSection } from "./PlanSelectionSection";
import { PaymentMethods } from "./PaymentMethods";
import { Community, Plan } from "../types/app.types";

interface MainContentProps {
  community: Community;
  selectedPlan: Plan | null;
  onPlanSelect: (plan: Plan) => void;
  selectedPaymentMethod: string | null;
  onPaymentMethodSelect: (method: string) => void;
  onCompletePurchase: () => void;
  showSuccess: boolean;
}

export const MainContent: React.FC<MainContentProps> = ({
  community,
  selectedPlan,
  onPlanSelect,
  selectedPaymentMethod,
  onPaymentMethodSelect,
  onCompletePurchase,
  showSuccess
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 via-background to-primary/5">
      <div className="container max-w-2xl mx-auto pt-8 px-4 space-y-12">
        <CommunityHeader community={community} />

        <PlanSelectionSection 
          plans={community.subscription_plans}
          selectedPlan={selectedPlan}
          onPlanSelect={onPlanSelect}
        />

        {selectedPlan && (
          <PaymentMethods
            selectedPlan={selectedPlan}
            selectedPaymentMethod={selectedPaymentMethod}
            onPaymentMethodSelect={onPaymentMethodSelect}
            onCompletePurchase={onCompletePurchase}
            communityInviteLink={community.telegram_invite_link}
            showSuccess={showSuccess}
          />
        )}
      </div>
    </div>
  );
};
