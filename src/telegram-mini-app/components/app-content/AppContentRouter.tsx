
import { TelegramUser } from "@/telegram-mini-app/types/telegramTypes";
import { Community } from "@/telegram-mini-app/types/community.types";
import { MainContent } from "@/telegram-mini-app/components/MainContent";
import { CommunityNotFound } from "@/telegram-mini-app/components/CommunityNotFound";
import { EmailCollectionWrapper } from "@/telegram-mini-app/components/EmailCollectionWrapper";
import { DebugInfo } from "@/telegram-mini-app/components/debug/DebugInfo";
import { ErrorDisplay } from "@/telegram-mini-app/components/ErrorDisplay";
import { isDevelopment } from "@/telegram-mini-app/utils/telegramUtils";

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
  // Don't render anything if still loading
  if (loading) return null;
  
  // Show error display if there's an error
  if (errorState) {
    return (
      <ErrorDisplay 
        error={errorState} 
        onRetry={onRetry} 
      />
    );
  }
  
  // Debug info in development mode
  const showDebugInfo = isDevelopment();

  console.log('🧭 App Content Router:');
  console.log('📌 showEmailForm:', showEmailForm);
  console.log('📌 telegramUser:', telegramUser);
  console.log('📌 community:', community);

  // If we're in the email collection phase and we have a valid telegram user
  if (showEmailForm && telegramUser) {
    console.log('📬 Rendering email collection form');
    return (
      <>
        <EmailCollectionWrapper
          telegramUser={telegramUser}
          onComplete={() => {
            console.log('📬 Email collection completed');
            setShowEmailForm(false);
          }}
        />
        {showDebugInfo && <DebugInfo data={{ telegramUser, showEmailForm, community }} />}
      </>
    );
  }
  
  // If no community found, show the community not found message
  if (!community) {
    console.log('🔍 No community found');
    return (
      <>
        <CommunityNotFound />
        {showDebugInfo && <DebugInfo data={{ telegramUser, showEmailForm, community }} />}
      </>
    );
  }
  
  // Render the main content with the community data
  console.log('🚀 Rendering main content with community');
  return (
    <>
      <MainContent community={community} />
      {showDebugInfo && <DebugInfo data={{ telegramUser, showEmailForm, community }} />}
    </>
  );
};
