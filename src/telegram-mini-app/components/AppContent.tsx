import React from 'react';
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/auth/contexts/AuthContext";
import { useTelegram } from "../hooks/useTelegram";
import { MainContent } from "./MainContent";
import { SubscriptionCheckout } from "./SubscriptionCheckout";
import { createLogger } from "@/telegram-mini-app/utils/debugUtils";
import { SubscriptionPlan } from "@/types";
import { Plan, Community, Subscription as SubscriptionType } from "@/telegram-mini-app/types/community.types";
import { useCommunityData } from "../hooks/useCommunityData";
import { useUserSubscriptions } from "../hooks/useUserSubscriptions";
import { useCommunityChannels } from "../hooks/useCommunityChannels";

const logger = createLogger("AppContent");

const mapSubscriptionPlanForDisplay = (plans: any[]): any[] => {
  return plans.map(plan => ({
    ...plan,
    duration: plan.duration || 30,
    duration_type: plan.duration_type || 'days',
    description: plan.description || ''
  }));
}

export const AppContent: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { tg, isTelegramAvailable } = useTelegram();
  const [searchParams] = useSearchParams();
  const startParam = searchParams.get("start");
  const [showCheckout, setShowCheckout] = useState(false);
  const [communityInviteLink, setCommunityInviteLink] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  
  const {
    community,
    loading: communityLoading,
    error: communityError,
  } = useCommunityData(startParam);
  
  const {
    subscriptions: userSubscriptions,
    isLoading: subscriptionsLoading,
    error: subscriptionError,
    refetch: refreshSubscription,
  } = useUserSubscriptions(user?.id, community?.id);
  
  const isLoading = authLoading || communityLoading || subscriptionsLoading;
  const error = communityError || subscriptionError;
  
  useEffect(() => {
    logger.log("AppContent - User:", user);
    logger.log("AppContent - Community:", community);
    logger.log("AppContent - Subscriptions:", userSubscriptions);
    logger.log("AppContent - Telegram:", tg);
    logger.log("AppContent - Is Telegram Available:", isTelegramAvailable);
  }, [user, community, userSubscriptions, tg, isTelegramAvailable]);
  
  useEffect(() => {
    if (tg) {
      tg.ready();
    }
  }, [tg]);
  
  const handlePlanSelect = (plan: Plan) => {
    logger.log("Plan selected:", plan);
    setSelectedPlan(plan as unknown as SubscriptionPlan);
    setShowCheckout(true);
  };
  
  const handleCompletePurchase = () => {
    logger.log("Purchase completed");
    setShowCheckout(false);
    setSelectedPlan(null);
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
    return <div className="w-full h-full flex items-center justify-center text-red-500">Error: {typeof error === 'string' ? error : 'Unknown error'}</div>;
  }
  
  if (!user) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
        <p>Please log in to continue:</p>
        <button className="bg-blue-500 text-white px-4 py-2 rounded">Login with Telegram</button>
      </div>
    );
  }
  
  if (!community) {
    return <div className="w-full h-full flex items-center justify-center">Invalid community</div>;
  }
  
  const { channels, isLoading: channelsLoading } = useCommunityChannels(community.id);
  
  if (showCheckout && selectedPlan) {
    return (
      <SubscriptionCheckout
        selectedPlan={selectedPlan as unknown as Plan}
        onCompletePurchase={handleCompletePurchase}
        onCancel={handleCancelCheckout}
        communityInviteLink={communityInviteLink}
      />
    );
  }
  
  return (
    <MainContent
      community={community}
      telegramUser={user}
      selectedPlan={selectedPlan}
      showPaymentMethods={showCheckout}
      showSuccess={false}
      subscriptions={userSubscriptions || []}
      activeTab="subscribe"
      handleTabChange={() => {}}
      handlePlanSelect={handlePlanSelect}
      handleCompletePurchase={handleCompletePurchase}
      handleRenewSubscription={() => {}}
      handleSelectCommunity={() => {}}
      subscriptionsLoading={subscriptionsLoading}
    />
  );
};

export default AppContent;
