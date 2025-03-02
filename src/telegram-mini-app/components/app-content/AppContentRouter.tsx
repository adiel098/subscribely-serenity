
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
    isCheckingUserData,
    email: telegramUser?.email || 'none'
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
        <li><span className="font-bold">User Email:</span> {telegramUser?.email || 'Not set'}</li>
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

  // NEW PRIORITY-BASED ROUTING SYSTEM
  
  // PRIORITY 1: Show email form if we have a user ID but no email
  if (telegramUserId && (!telegramUser?.email || showEmailForm)) {
    console.log('📧 PRIORITY 1: Showing email form (User without email)');
    
    // Create minimal user if needed
    const userForEmailForm = telegramUser || { 
      id: telegramUserId,
      first_name: '',
      username: ''
    };
    
    return (
      <>
        {renderDebugInfo()}
        <EmailCollectionWrapper 
          telegramUser={userForEmailForm} 
          onComplete={() => {
            console.log('📧 Email collection completed, redirecting to main content');
            setShowEmailForm(false);
          }}
        />
      </>
    );
  }
  
  // PRIORITY 2: Show error state
  if (errorState) {
    console.log('❌ PRIORITY 2: Showing error state');
    return (
      <>
        {renderDebugInfo()}
        <ErrorDisplay 
          errorMessage={errorState}
          telegramUserId={telegramUserId || ''}
          onRetry={onRetry}
        />
      </>
    );
  }
  
  // PRIORITY 3: Show main content if we have a user with email and a community
  if (telegramUser?.email && community) {
    console.log('✅ PRIORITY 3: Showing main content (User with email and community)');
    return (
      <>
        {renderDebugInfo()}
        <MainContent community={community} telegramUser={telegramUser} />
      </>
    );
  }
  
  // PRIORITY 4: Show community not found if no community was found
  if (!community && !loading) {
    console.log('❓ PRIORITY 4: Showing community not found');
    return (
      <>
        {renderDebugInfo()}
        <CommunityNotFound />
      </>
    );
  }
  
  // PRIORITY 5: Error boundary (fallback) when no other conditions are met
  return renderErrorBoundary();
};
