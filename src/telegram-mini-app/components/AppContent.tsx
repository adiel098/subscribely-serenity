import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/auth/contexts/AuthContext";
import { useTelegram } from "@/hooks/useTelegram";
import { Main } from "./Main";
import { SubscriptionCheckout } from "./SubscriptionCheckout";
import { TelegramLoginButton } from "./TelegramLoginButton";
import { useCommunityData } from "../hooks/useCommunityData";
import { useSubscription } from "../hooks/useSubscription";
import { Subscription as SubscriptionType } from "@/telegram-mini-app/types/community.types";
import { createLogger } from "@/telegram-mini-app/utils/debugUtils";
import { SubscriptionPlan } from "@/types";

const logger = createLogger("AppContent");

// Just add this one function at the appropriate location in the file
// This function should handle mapping between types appropriately

const mapSubscriptionPlanForDisplay = (plans: any[]): any[] => {
  return plans.map(plan => ({
    ...plan,
    duration: plan.duration || 30,
    duration_type: plan.duration_type || 'days'
  }));
}

export const AppContent: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { tg, isTelegramAvailable } = useTelegram();
  const [searchParams] = useSearchParams();
  const startParam = searchParams.get("start");
  const [showCheckout, setShowCheckout] = useState(false);
  const [communityInviteLink, setCommunityInviteLink] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  
  const {
    community,
    isLoading: communityLoading,
    error: communityError,
    refreshCommunity,
  } = useCommunityData(startParam);
  
  const {
    subscription,
    isLoading: subscriptionLoading,
    error: subscriptionError,
    refreshSubscription,
  } = useSubscription(user?.id, community?.id);
  
  const isLoading = authLoading || communityLoading || subscriptionLoading;
  const error = communityError || subscriptionError;
  
  useEffect(() => {
    logger.log("AppContent - User:", user);
    logger.log("AppContent - Community:", community);
    logger.log("AppContent - Subscription:", subscription);
    logger.log("AppContent - Telegram:", tg);
    logger.log("AppContent - Is Telegram Available:", isTelegramAvailable);
  }, [user, community, subscription, tg, isTelegramAvailable]);
  
  useEffect(() => {
    if (tg) {
      tg.ready();
    }
  }, [tg]);
  
  const handlePlanSelect = (plan: SubscriptionPlan) => {
    logger.log("Plan selected:", plan);
    setSelectedPlan(plan);
    setShowCheckout(true);
  };
  
  const handleCompletePurchase = () => {
    logger.log("Purchase completed");
    setShowCheckout(false);
    setSelectedPlan(null);
    refreshCommunity();
    refreshSubscription();
  };
  
  const handleCancelCheckout = () => {
    setShowCheckout(false);
    setSelectedPlan(null);
  };
  
  if (isLoading) {
    return <div className="w-full h-full flex items-center justify-center">Loading...</div>;
  }
  
  if (error) {
    return <div className="w-full h-full flex items-center justify-center text-red-500">Error: {error.message}</div>;
  }
  
  if (!user) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
        <p>Please log in to continue:</p>
        <TelegramLoginButton />
      </div>
    );
  }
  
  if (!community) {
    return <div className="w-full h-full flex items-center justify-center">Invalid community</div>;
  }
  
  if (showCheckout && selectedPlan) {
    return (
      <SubscriptionCheckout
        selectedPlan={selectedPlan}
        onCompletePurchase={handleCompletePurchase}
        onCancel={handleCancelCheckout}
        communityInviteLink={communityInviteLink}
      />
    );
  }
  
  return (
    <Main
      community={community}
      userSubscriptions={subscription ? [subscription] : []}
      onPlanSelect={handlePlanSelect}
      showPaymentMethods={showCheckout}
      communityInviteLink={communityInviteLink}
      setCommunityInviteLink={setCommunityInviteLink}
      activeSubscription={subscription}
    />
  );
};
