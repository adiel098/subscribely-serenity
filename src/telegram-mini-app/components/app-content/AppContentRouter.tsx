
import React, { useEffect } from "react";
import { TelegramUser } from "@/telegram-mini-app/types/telegramTypes";
import { Community } from "@/telegram-mini-app/types/community.types";
import { ErrorDisplay } from "@/telegram-mini-app/components/ErrorDisplay";
import { CommunityNotFound } from "@/telegram-mini-app/components/CommunityNotFound";
import { EmailCollectionWrapper } from "@/telegram-mini-app/components/EmailCollectionWrapper";
import { MainContent } from "@/telegram-mini-app/components/MainContent";
import { DebugInfo } from "@/telegram-mini-app/components/debug/DebugInfo";

interface AppContentRouterProps {
  loading: boolean;
  errorState: string | null;
  telegramUserId: string | null;
  community: Community | null;
  telegramUser: TelegramUser | null;
  showEmailForm: boolean;
  isCheckingUserData: boolean;
  onRetry: () => void;
  setShowEmailForm: (show: boolean) => void;
}

export const AppContentRouter: React.FC<AppContentRouterProps> = ({
  loading,
  errorState,
  telegramUserId,
  community,
  telegramUser,
  showEmailForm,
  isCheckingUserData,
  onRetry,
  setShowEmailForm
}) => {
  // Show debug info for development
  const activeTab = "subscribe"; // Default active tab
  
  // CRITICAL FIX: Add effect to log state changes for debugging
  useEffect(() => {
    console.log('🚦 AppContentRouter state:', {
      loading,
      errorState,
      telegramUserExists: !!telegramUser,
      communityExists: !!community,
      showEmailForm,
      isCheckingUserData,
      hasEmail: telegramUser?.email ? true : false
    });
  }, [loading, errorState, telegramUser, community, showEmailForm, isCheckingUserData]);
  
  // Debug section at the top that will show in dev mode
  const renderDebugInfo = () => (
    <DebugInfo 
      telegramUser={telegramUser} 
      community={community} 
      activeTab={activeTab}
      showEmailForm={showEmailForm}
      isCheckingUserData={isCheckingUserData}
    />
  );

  // Handle error state but with valid user ID
  if (errorState && telegramUserId) {
    console.log('🔄 We have an error but also have a direct telegramUserId:', telegramUserId);
    return (
      <>
        {renderDebugInfo()}
        <ErrorDisplay 
          errorMessage={errorState}
          telegramUserId={telegramUserId}
          onRetry={onRetry}
        />
      </>
    );
  }

  // Don't render anything else during loading
  if (loading) {
    console.log('⏳ Still loading, not rendering content yet');
    return renderDebugInfo();
  }

  // Missing community
  if (!community) {
    console.log('❌ Community not found');
    return (
      <>
        {renderDebugInfo()}
        <CommunityNotFound />
      </>
    );
  }

  // STRICT ENFORCEMENT: Email form must be shown before community content
  // This is our critical gate that ensures users provide email before accessing content
  if (showEmailForm && telegramUser) {
    console.log('📧 ROUTING: Showing email collection form');
    return (
      <>
        {renderDebugInfo()}
        <EmailCollectionWrapper 
          telegramUser={telegramUser} 
          onComplete={() => {
            console.log('📧 CRITICAL FIX: Email collection completed in router, now showing community content');
            console.log('📧 CRITICAL FIX: Setting showEmailForm to false to force render of MainContent');
            // Force update the state to trigger re-render with setTimeout(0)
            window.setTimeout(() => {
              setShowEmailForm(false);
              console.log('📧 showEmailForm set to false after short delay');
            }, 0);
          }}
        />
      </>
    );
  }
  
  // Force check if user needs email collection
  if (telegramUser && !telegramUser.email && !isCheckingUserData) {
    console.log('🛑 SAFETY CHECK: User missing email, forcing email collection');
    window.setTimeout(() => {
      setShowEmailForm(true);
      console.log('📧 SAFETY CHECK: Forced showEmailForm to true');
    }, 0);
    return renderDebugInfo();
  }

  // Main content - only show if not loading, community exists, email form is not needed
  console.log('🎉 Showing main content with:', { 
    community: community?.name, 
    user: telegramUser?.username,
    plans: community?.subscription_plans?.length || 0,
    showEmailForm, 
    emailProvided: telegramUser?.email ? true : false
  });
  
  return (
    <>
      {renderDebugInfo()}
      <MainContent community={community} telegramUser={telegramUser} />
    </>
  );
};
