
import React from "react";
import { TelegramUser } from "@/telegram-mini-app/types/telegramTypes";
import { Community } from "@/telegram-mini-app/types/community.types";
import { ErrorDisplay } from "@/telegram-mini-app/components/ErrorDisplay";
import { CommunityNotFound } from "@/telegram-mini-app/components/CommunityNotFound";
import { EmailCollectionWrapper } from "@/telegram-mini-app/components/EmailCollectionWrapper";
import { MainContent } from "@/telegram-mini-app/components/MainContent";
import { DebugInfo } from "@/telegram-mini-app/components/debug/DebugInfo";
import { AlertTriangle } from "lucide-react";

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
  console.log("🧭 AppContentRouter rendering with:", {
    loading,
    errorState,
    telegramUserId,
    communityExists: !!community,
    telegramUserExists: !!telegramUser,
    showEmailForm,
    isCheckingUserData
  });
  
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

  // Error boundary for debugging - show when nothing else renders
  const renderErrorBoundary = () => (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md m-4">
      <div className="flex items-center mb-2">
        <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
        <h3 className="font-semibold text-yellow-700">Routing Debug Info</h3>
      </div>
      <ul className="text-xs text-gray-600 space-y-1">
        <li><span className="font-bold">Loading:</span> {loading ? 'Yes' : 'No'}</li>
        <li><span className="font-bold">Error:</span> {errorState || 'None'}</li>
        <li><span className="font-bold">Telegram User ID:</span> {telegramUserId || 'Missing'}</li>
        <li><span className="font-bold">Community:</span> {community?.name || 'Not loaded'}</li>
        <li><span className="font-bold">Telegram User:</span> {telegramUser?.username || 'Not loaded'}</li>
        <li><span className="font-bold">Show Email Form:</span> {showEmailForm ? 'Yes' : 'No'}</li>
        <li><span className="font-bold">Checking User Data:</span> {isCheckingUserData ? 'Yes' : 'No'}</li>
      </ul>
      <button 
        onClick={onRetry}
        className="mt-3 text-xs bg-blue-500 text-white px-2 py-1 rounded"
      >
        Retry
      </button>
    </div>
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
    return (
      <>
        {renderDebugInfo()}
        <div className="p-4 text-center text-gray-600">
          <p>Loading... Please wait.</p>
        </div>
      </>
    );
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
    console.log('📧 ROUTING: User MUST provide email before accessing community content');
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
  
  // Additional safety check - if user has no email, force email collection
  // This is a failsafe in case the showEmailForm flag wasn't properly set
  if (telegramUser && !telegramUser.email) {
    console.log('🛑 SAFETY CHECK: User missing email, redirecting to email collection form');
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

  // Main content - only show if not loading, community exists, email form is not needed,
  // and the user has provided an email
  if (telegramUser && community) {
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
  }
  
  // If we get here, something went wrong in the routing logic
  console.error('❌ ROUTER ERROR: No routing condition matched!', {
    loading, errorState, telegramUserId, community, telegramUser, showEmailForm
  });
  
  // Render a fallback with debug info
  return renderErrorBoundary();
};
