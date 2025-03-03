
import React, { useState, useEffect } from "react";
import { LoadingScreen } from "./LoadingScreen";
import { ErrorDisplay } from "./ErrorDisplay";
import { CommunityNotFound } from "./CommunityNotFound";
import { Plan } from "../types/community.types";
import { useTelegramUser } from "../hooks/useTelegramUser";
import { useCommunityData } from "../hooks/useCommunityData";
import { useUserSubscriptions } from "../hooks/useUserSubscriptions";
import { MainContent } from "./MainContent";
import { EmailCollectionWrapper } from "./EmailCollectionWrapper";
import { TelegramInitializer } from "./TelegramInitializer";
import { UserDataChecker } from "./app-content/UserDataChecker";
import { ErrorNotifier } from "./app-content/ErrorNotifier";
import { LoadingIndicator } from "./app-content/LoadingIndicator";
import { AppContentRouter } from "./app-content/AppContentRouter";

interface AppContentProps {
  communityId: string;
  telegramUserId?: string;
}

const AppContent: React.FC<AppContentProps> = ({ communityId, telegramUserId }) => {
  const [isCheckingUserData, setIsCheckingUserData] = useState(true);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [activeTab, setActiveTab] = useState<string>("subscribe");
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Telegram user data
  const { user: telegramUser, loading: userLoading, error: userError, refetch: refetchUser } = 
    useTelegramUser(communityId, telegramUserId);
  
  // Community data
  const { community, loading: communityLoading, error: communityError } = 
    useCommunityData(communityId);
  
  // User subscriptions data
  const { 
    subscriptions, 
    loading: subscriptionsLoading, 
    error: subscriptionsError,
    refetch: refetchSubscriptions,
    renewSubscription 
  } = useUserSubscriptions(telegramUser?.id);
  
  // Reset selected plan when community changes
  useEffect(() => {
    if (community) {
      setSelectedPlan(null);
      setShowPaymentMethods(false);
    }
  }, [community]);
  
  // Methods
  const handlePlanSelect = (plan: Plan) => {
    setSelectedPlan(plan);
    setShowPaymentMethods(true);
    
    // Scroll to payment methods section
    setTimeout(() => {
      const element = document.getElementById('payment-methods');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSelectedPlan(null);
    setShowPaymentMethods(false);
    setShowSuccess(false);
  };
  
  const handleCompletePurchase = () => {
    setShowSuccess(true);
    refetchSubscriptions();
  };
  
  const handleRenewSubscription = (subscription: any) => {
    renewSubscription(subscription);
  };
  
  const handleSelectCommunity = (community: any) => {
    console.log("Selected community:", community);
    // Logic to navigate to the selected community will go here
  };
  
  // Loading state
  if (communityLoading || userLoading) {
    return <LoadingScreen />;
  }
  
  // Check for errors
  if (userError) {
    return <ErrorDisplay message={`Failed to load user data: ${userError}`} />;
  }
  
  if (communityError) {
    return <ErrorDisplay message={`Failed to load community data: ${communityError}`} />;
  }
  
  // No community found
  if (!community) {
    return <CommunityNotFound communityId={communityId} />;
  }

  // Show email collection form if needed
  if (showEmailForm && telegramUser) {
    return (
      <EmailCollectionWrapper 
        telegramUser={telegramUser}
        communityId={communityId}
        onSuccess={() => {
          setShowEmailForm(false);
          refetchUser();
        }}
      />
    );
  }

  return (
    <>
      <TelegramInitializer />
      
      <UserDataChecker
        telegramUser={telegramUser}
        userLoading={userLoading}
        setIsCheckingUserData={setIsCheckingUserData}
        setShowEmailForm={setShowEmailForm}
        setErrorState={setErrorState}
      />
      
      <ErrorNotifier error={errorState} />
      
      <LoadingIndicator isLoading={isCheckingUserData} />
      
      <AppContentRouter
        isCheckingUserData={isCheckingUserData}
        community={community}
        telegramUser={telegramUser}
        selectedPlan={selectedPlan}
        showPaymentMethods={showPaymentMethods}
        showSuccess={showSuccess}
        subscriptions={subscriptions}
        activeTab={activeTab}
        handleTabChange={handleTabChange}
        handlePlanSelect={handlePlanSelect}
        handleCompletePurchase={handleCompletePurchase}
        handleRenewSubscription={handleRenewSubscription}
        handleSelectCommunity={handleSelectCommunity}
        subscriptionsLoading={subscriptionsLoading}
      />
    </>
  );
};

export default AppContent;
