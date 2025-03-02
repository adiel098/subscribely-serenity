
import React from "react";
import { TelegramUser } from "@/telegram-mini-app/types/telegramTypes";
import { Community } from "@/telegram-mini-app/types/community.types";

interface DebugInfoProps {
  telegramUser: TelegramUser | null;
  community: Community | null;
  activeTab: string;
  showEmailForm?: boolean;
  isCheckingUserData?: boolean;
}

export const DebugInfo: React.FC<DebugInfoProps> = ({ 
  telegramUser, 
  community, 
  activeTab,
  showEmailForm,
  isCheckingUserData
}) => {
  if (process.env.NODE_ENV !== 'development') return null;
  
  return (
    <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 p-3 rounded mb-4 text-xs">
      <p><strong>📊 Debug Info:</strong></p>
      <div className="grid grid-cols-2 gap-1">
        <div>
          <p><strong>User ID:</strong> {telegramUser?.id || 'Not available'}</p>
          <p><strong>User ID type:</strong> {telegramUser ? typeof telegramUser.id : 'N/A'}</p>
          <p><strong>Username:</strong> {telegramUser?.username || 'Not available'}</p>
          <p><strong>Name:</strong> {telegramUser?.first_name || ''} {telegramUser?.last_name || ''}</p>
          <p><strong>Email:</strong> {telegramUser?.email || 'Not available'}</p>
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
        </div>
      </div>
      
      <div className="mt-2 border-t border-yellow-400 pt-2">
        <p><strong>🔄 Current URL:</strong> {window.location.href}</p>
        <p><strong>📱 Development Mode:</strong> {process.env.NODE_ENV === 'development' ? '✅ Yes' : '❌ No'}</p>
        <p><strong>🚦 User Flow:</strong> {!telegramUser ? 'Loading User' : showEmailForm ? 'Email Collection' : 'Community View'}</p>
      </div>
    </div>
  );
};
