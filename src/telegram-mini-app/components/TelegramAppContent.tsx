
import React from "react";
import { Community } from "@/telegram-mini-app/types/community.types";
import { TelegramUser } from "@/telegram-mini-app/hooks/useTelegramUser";
import { LoadingScreen } from "@/telegram-mini-app/components/LoadingScreen";
import { CommunityNotFound } from "@/telegram-mini-app/components/CommunityNotFound";
import { EmailCollectionForm } from "@/telegram-mini-app/components/EmailCollectionForm";
import { MainContent } from "@/telegram-mini-app/components/MainContent";
import { DevelopmentModeAlert } from "@/telegram-mini-app/components/DevelopmentModeAlert";

interface TelegramAppContentProps {
  isDevelopment: boolean;
  telegramWebAppAvailable: boolean;
  isLoading: boolean;
  community: Community | null;
  telegramUser: TelegramUser | null;
  showEmailForm: boolean;
  onEmailFormComplete: () => void;
}

export const TelegramAppContent: React.FC<TelegramAppContentProps> = ({
  isDevelopment,
  telegramWebAppAvailable,
  isLoading,
  community,
  telegramUser,
  showEmailForm,
  onEmailFormComplete
}) => {
  if (isLoading) {
    console.log('⏳ Showing loading screen');
    return <LoadingScreen />;
  }

  if (!community) {
    console.log('❌ Community not found');
    return <CommunityNotFound />;
  }

  if (showEmailForm && telegramUser) {
    console.log('📝 Showing email collection form for user ID:', telegramUser.id);
    return <EmailCollectionForm telegramUserId={telegramUser.id} onComplete={onEmailFormComplete} />;
  }

  console.log('🎉 Showing main content with:', { 
    community: community?.name, 
    user: telegramUser?.username 
  });
  
  return (
    <>
      {isDevelopment && (
        <DevelopmentModeAlert telegramWebAppAvailable={telegramWebAppAvailable} />
      )}
      <MainContent community={community} telegramUser={telegramUser} />
    </>
  );
};
