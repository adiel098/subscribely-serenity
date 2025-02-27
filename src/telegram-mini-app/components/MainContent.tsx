
import React, { useState } from "react";
import { Community } from "@/telegram-mini-app/types/community.types";
import { CommunityHeader } from "./CommunityHeader";
import { SubscriptionPlans } from "./SubscriptionPlans";
import { PaymentMethods } from "./PaymentMethods";
import PlanCards from "./PlanCards";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface MainContentProps {
  community: Community;
  telegramUser: any;
}

enum Step {
  PLAN_SELECTION,
  PAYMENT_METHOD,
}

export const MainContent = ({ community, telegramUser }: MainContentProps) => {
  const [step, setStep] = useState<Step>(Step.PLAN_SELECTION);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
  };

  const handlePaymentMethodSelect = (method) => {
    setSelectedPaymentMethod(method);
  };

  const handleCompletePurchase = () => {
    setShowSuccess(true);
  };

  const handleBack = () => {
    if (step === Step.PAYMENT_METHOD) {
      setStep(Step.PLAN_SELECTION);
      setSelectedPaymentMethod(null);
    }
  };

  const handleContinue = () => {
    if (step === Step.PLAN_SELECTION && selectedPlan) {
      setStep(Step.PAYMENT_METHOD);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case Step.PLAN_SELECTION:
        return (
          <>
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Choose Your Plan
              </h2>
              <p className="text-gray-600">
                Select the perfect membership plan for you
              </p>
            </div>

            {/* New plan cards component */}
            <PlanCards
              plans={community.subscription_plans}
              selectedPlan={selectedPlan}
              onPlanSelect={handlePlanSelect}
            />

            {selectedPlan && (
              <div className="mt-6 animate-fade-in">
                <Button 
                  className="w-full bg-gradient-to-r from-primary to-primary/80 text-white hover:from-primary/90 hover:to-primary"
                  size="lg"
                  onClick={handleContinue}
                >
                  Continue to Payment
                </Button>
              </div>
            )}
          </>
        );
      case Step.PAYMENT_METHOD:
        return (
          <>
            <div className="mb-6">
              <Button 
                variant="ghost" 
                className="flex items-center text-gray-600 hover:text-gray-900 mb-2"
                onClick={handleBack}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Plans
              </Button>
            </div>
            
            <PaymentMethods
              selectedPlan={selectedPlan}
              selectedPaymentMethod={selectedPaymentMethod}
              onPaymentMethodSelect={handlePaymentMethodSelect}
              onCompletePurchase={handleCompletePurchase}
              communityInviteLink={community.telegram_invite_link}
              showSuccess={showSuccess}
              telegramUserId={telegramUser?.id}
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 pb-20">
      <CommunityHeader community={community} />
      
      <div className="mt-8 animate-fade-in">
        {renderStepContent()}
      </div>
    </div>
  );
};
