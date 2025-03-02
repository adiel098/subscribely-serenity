
import React, { useEffect } from "react";
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
  
  // HIGHEST PRIORITY: Show email form whenever possible
  // This takes precedence over everything else to ensure users can provide email
  if (telegramUserId && showEmailForm) {
    console.log('📧 TOP PRIORITY EMAIL COLLECTION: Showing email form immediately with ID:', telegramUserId);
    return (
      <>
        {/* Only show debug if explicitly enabled */}
        {window.location.search.includes('debug=true') && renderDebugInfo()}
        <EmailCollectionWrapper 
          telegramUser={telegramUser || { id: telegramUserId }} 
          onComplete={() => {
            console.log('📧 Email collection completed, showing community content');
            setShowEmailForm(false);
          }}
        />
      </>
    );
  }
  
  // Second priority: Also show email form if user exists but has no email
  if (telegramUserId && telegramUser && !telegramUser.email) {
    console.log('📧 SECONDARY EMAIL COLLECTION: User exists but missing email');
    return (
      <>
        {/* Only show debug if explicitly enabled */}
        {window.location.search.includes('debug=true') && renderDebugInfo()}
        <EmailCollectionWrapper 
          telegramUser={telegramUser} 
          onComplete={() => {
            console.log('📧 Email collection completed, showing community content');
            setShowEmailForm(false);
          }}
        />
      </>
    );
  }
  
  // Debug section at the top that will show ONLY when debug=true is in URL
  const activeTab = "subscribe"; // Default active tab
  
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
  
  // The rest of the routing logic
  
  // First, handle error cases
  if (errorState && telegramUserId) {
    return (
      <>
        {window.location.search.includes('debug=true') && renderDebugInfo()}
        <ErrorDisplay 
          errorMessage={errorState}
          telegramUserId={telegramUserId}
          onRetry={onRetry}
        />
      </>
    );
  }

  // During initial loading, show minimal UI
  if (loading && !telegramUser) {
    // Completely blank during initial load - no transitions
    return window.location.search.includes('debug=true') ? renderDebugInfo() : null;
  }
  
  // Missing community
  if (!community && !loading) {
    return (
      <>
        {window.location.search.includes('debug=true') && renderDebugInfo()}
        <CommunityNotFound />
      </>
    );
  }
  
  // Main content - only show if we have both a telegramUser (with email) and community
  if (telegramUser && telegramUser.email && community) {
    return (
      <>
        {window.location.search.includes('debug=true') && renderDebugInfo()}
        <MainContent community={community} telegramUser={telegramUser} />
      </>
    );
  }
  
  // If we're still loading but have some data, show appropriate loading state
  if (loading) {
    return (
      <>
        {window.location.search.includes('debug=true') && renderDebugInfo()}
        <div className="h-screen w-full flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your experience...</p>
          </div>
        </div>
      </>
    );
  }
  
  // Fallback for any edge cases - show email form as priority if we have a userId
  if (telegramUserId) {
    console.log('📧 FALLBACK EMAIL COLLECTION: Showing email form with ID:', telegramUserId);
    return (
      <>
        {window.location.search.includes('debug=true') && renderDebugInfo()}
        <EmailCollectionWrapper 
          telegramUser={{ id: telegramUserId }} 
          onComplete={() => {
            console.log('📧 Email collection completed, showing community content');
            setShowEmailForm(false);
          }}
        />
      </>
    );
  }
  
  // Last resort - error boundary (only shown when debug=true in URL)
  return window.location.search.includes('debug=true') ? renderErrorBoundary() : (
    <div className="h-screen w-full flex items-center justify-center">
      <div className="text-center p-4">
        <h3 className="font-bold text-gray-700 mb-2">Connection Issue</h3>
        <p className="text-gray-600 mb-4">Unable to connect to Telegram. Please try again.</p>
        <button 
          onClick={onRetry}
          className="px-4 py-2 bg-blue-500 text-white rounded-md"
        >
          Retry Connection
        </button>
      </div>
    </div>
  );
};
