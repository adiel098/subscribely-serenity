
import React from "react";
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

  // CRITICAL FIX: Show email form if needed - this check needs to happen BEFORE showing the main content
  // This enforces that new users must provide an email before seeing the community page
  if (showEmailForm && telegramUser) {
    console.log('📧 ROUTING: User needs to provide email before accessing community content');
    return (
      <>
        {renderDebugInfo()}
        <EmailCollectionWrapper 
          telegramUser={telegramUser} 
          onComplete={() => {
            console.log('📧 Email collection completed, now showing community content');
            setShowEmailForm(false);
          }}
        />
      </>
    );
  }

  // Main content - only show if not loading, community exists, and email form is not needed
  console.log('🎉 Showing main content with:', { 
    community: community?.name, 
    user: telegramUser?.username,
    plans: community?.subscription_plans?.length || 0,
    showEmailForm, // Log this to verify the state
    emailProvided: telegramUser?.email ? true : false
  });
  
  return (
    <>
      {renderDebugInfo()}
      <MainContent community={community} telegramUser={telegramUser} />
    </>
  );
};
