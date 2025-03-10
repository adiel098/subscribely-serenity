
import React from "react";
import { useAppContent } from "../../hooks/useAppContent";
import { TelegramInitializer } from "../TelegramInitializer";
import { UserDataChecker } from "./UserDataChecker";
import { ErrorNotifier } from "./ErrorNotifier";
import { LoadingIndicator } from "./LoadingIndicator";
import { AppContentRouter } from "./AppContentRouter";
import { EmailCollectionWrapper } from "../EmailCollectionWrapper";
import { ErrorDisplay } from "../ErrorDisplay";
import { CommunityNotFound } from "../CommunityNotFound";

interface AppContentProps {
  communityId: string;
  telegramUserId?: string;
}

const AppContent: React.FC<AppContentProps> = ({ communityId, telegramUserId }) => {
  const {
    // States
    isCheckingUserData,
    showEmailForm,
    errorState,
    selectedPlan,
    activeTab,
    showPaymentMethods,
    showSuccess,
    telegramUser,
    displayCommunity,
    community,
    subscriptions,
    subscriptionsLoading,
    // Loading states
    userLoading,
    communityLoading,
    // Errors
    userError,
    communityError,
    // Actions & Handlers
    setIsCheckingUserData,
    setShowEmailForm,
    setErrorState,
    handlePlanSelect,
    handleTabChange,
    handleCompletePurchase,
    handleRenewSubscription,
    handleSelectCommunity,
    handleRetry,
    handleTimeout,
    refetchUser
  } = useAppContent(communityId, telegramUserId);

  // Loading state
  if (communityLoading || userLoading) {
    return <LoadingIndicator 
      isLoading={true} 
      onTimeout={handleTimeout} 
      onRetry={handleRetry} 
    />;
  }
  
  // Check for errors
  if (userError) {
    return <ErrorDisplay 
      message={`Failed to load user data: ${userError}`} 
      telegramUserId={telegramUserId} 
      onRetry={handleRetry} 
    />;
  }
  
  if (communityError) {
    return <ErrorDisplay 
      message={`Failed to load community data: ${communityError}`} 
      telegramUserId={telegramUserId}
      onRetry={handleRetry} 
    />;
  }
  
  // No community found
  if (!community && !displayCommunity) {
    return <CommunityNotFound communityId={communityId} />;
  }

  // Show email collection form if needed
  if (showEmailForm && telegramUser) {
    return (
      <EmailCollectionWrapper 
        telegramUser={telegramUser}
        onComplete={() => {
          setShowEmailForm(false);
          refetchUser();
        }}
      />
    );
  }

  return (
    <>
      <TelegramInitializer onInitialized={(isInitialized, isDev) => {
        console.log('TelegramInitializer callback:', isInitialized, isDev);
      }} />
      
      <UserDataChecker
        telegramUser={telegramUser}
        userLoading={userLoading}
        setIsCheckingUserData={setIsCheckingUserData}
        setShowEmailForm={setShowEmailForm}
        setErrorState={setErrorState}
      />
      
      <ErrorNotifier errorState={errorState} />
      
      <LoadingIndicator 
        isLoading={isCheckingUserData} 
        onTimeout={handleTimeout}
        onRetry={handleRetry}
      />
      
      <AppContentRouter
        isCheckingUserData={isCheckingUserData}
        community={displayCommunity}
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
