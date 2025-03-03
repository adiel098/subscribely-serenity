
import React from "react";
import { TelegramUser } from "@/telegram-mini-app/types/telegramTypes";
import { Community } from "@/telegram-mini-app/types/community.types";
import { useSearchParams } from "react-router-dom";

export interface DebugInfoProps {
  telegramUser: TelegramUser | null;
  community: Community | null;
  activeTab?: string;
  showEmailForm?: boolean;
  isCheckingUserData?: boolean;
  activeSubscription?: any; // Added this property
}

export const DebugInfo: React.FC<DebugInfoProps> = ({ 
  telegramUser, 
  community, 
  activeTab,
  showEmailForm,
  isCheckingUserData,
  activeSubscription
}) => {
  const [searchParams] = useSearchParams();
  const showDebug = searchParams.get("debug") === "true";
  
  // Only show in development or if debug=true parameter is present
  if (!showDebug && process.env.NODE_ENV !== 'development') return null;
  
  // Flow state calculation
  let userFlowState = 'Loading User';
  if (telegramUser) {
    if (showEmailForm) {
      userFlowState = 'Email Collection (Required)';
    } else if (!telegramUser.email) {
      userFlowState = 'WARNING: Missing Email (Should be redirected)';
    } else {
      userFlowState = 'Community View';
    }
  }
  
  return (
    <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 p-3 rounded mb-4 text-xs">
      <p><strong>📊 Debug Info:</strong></p>
      <div className="grid grid-cols-2 gap-1">
        <div>
          <p><strong>User ID:</strong> {telegramUser?.id || 'Not available'}</p>
          <p><strong>User ID type:</strong> {telegramUser ? typeof telegramUser.id : 'N/A'}</p>
          <p><strong>Username:</strong> {telegramUser?.username || 'Not available'}</p>
          <p><strong>Name:</strong> {telegramUser?.first_name || ''} {telegramUser?.last_name || ''}</p>
          <p><strong>Email:</strong> {telegramUser?.email || '❌ Not provided'}</p>
          <p><strong>Photo URL:</strong> {telegramUser?.photo_url ? '✅ Available' : '❌ Not available'}</p>
          <p><strong>WebApp initData:</strong> {window.Telegram?.WebApp?.initData ? '✅ Available' : '❌ Not available'}</p>
        </div>
        <div>
          <p><strong>Community:</strong> {community?.name || 'Not available'}</p>
          <p><strong>Plans Count:</strong> {community?.subscription_plans?.length || 0}</p>
          <p><strong>Active Tab:</strong> {activeTab}</p>
          <p><strong>Show Email Form:</strong> {showEmailForm ? '✅ Yes' : '❌ No'}</p>
          <p><strong>Checking User Data:</strong> {isCheckingUserData ? '⏳ In progress' : '✅ Complete'}</p>
          <p><strong>WebApp Object:</strong> {window.Telegram?.WebApp ? '✅ Available' : '❌ Not available'}</p>
          <p><strong>User in InitData:</strong> {window.Telegram?.WebApp?.initDataUnsafe?.user ? '✅ Available' : '❌ Not available'}</p>
          <p><strong>Active Subscription:</strong> {activeSubscription ? '✅ Yes' : '❌ No'}</p>
        </div>
      </div>
      
      <div className="mt-2 border-t border-yellow-400 pt-2">
        <p><strong>🔄 Current URL:</strong> {window.location.href}</p>
        <p><strong>📱 Development Mode:</strong> {process.env.NODE_ENV === 'development' ? '✅ Yes' : '❌ No'}</p>
        <p><strong>🚦 User Flow:</strong> {userFlowState}</p>
      </div>
    </div>
  );
};
