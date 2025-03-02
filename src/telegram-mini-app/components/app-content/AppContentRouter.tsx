
import React from "react";
import { TelegramUser } from "@/telegram-mini-app/types/telegramTypes";
import { Community } from "@/telegram-mini-app/types/community.types";
import { ErrorDisplay } from "@/telegram-mini-app/components/ErrorDisplay";
import { CommunityNotFound } from "@/telegram-mini-app/components/CommunityNotFound";
import { EmailCollectionWrapper } from "@/telegram-mini-app/components/EmailCollectionWrapper";
import { MainContent } from "@/telegram-mini-app/components/MainContent";

interface AppContentRouterProps {
  loading: boolean;
  errorState: string | null;
  telegramUserId: string | null;
  community: Community | null;
  telegramUser: TelegramUser | null;
  showEmailForm: boolean;
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
  onRetry,
  setShowEmailForm
}) => {
  // Handle error state but with valid user ID
  if (errorState && telegramUserId) {
    console.log('🔄 We have an error but also have a direct telegramUserId:', telegramUserId);
    return (
      <ErrorDisplay 
        errorMessage={errorState}
        telegramUserId={telegramUserId}
        onRetry={onRetry}
      />
    );
  }

  // Don't render anything else during loading
  if (loading) {
    return null;
  }

  // Missing community
  if (!community) {
    console.log('❌ Community not found');
    return <CommunityNotFound />;
  }

  // Show email form
  if (showEmailForm && telegramUser) {
    console.log('📧 Showing email collection form for user:', telegramUser.username);
    return (
      <EmailCollectionWrapper 
        telegramUser={telegramUser} 
        onComplete={() => setShowEmailForm(false)}
      />
    );
  }

  // Main content
  console.log('🎉 Showing main content with:', { 
    community: community?.name, 
    user: telegramUser?.username,
    plans: community?.subscription_plans?.length || 0
  });
  
  return <MainContent community={community} telegramUser={telegramUser} />;
};
