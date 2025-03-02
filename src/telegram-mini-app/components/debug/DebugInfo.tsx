
import React from "react";
import { TelegramUser } from "@/telegram-mini-app/types/telegramTypes";
import { Community } from "@/telegram-mini-app/types/community.types";

interface DebugInfoProps {
  telegramUser: TelegramUser | null;
  community: Community | null;
  activeTab: string;
  showEmailForm?: boolean;
  isCheckingUserData?: boolean;
  userExistsInDatabase?: boolean | null;
}

export const DebugInfo: React.FC<DebugInfoProps> = ({ 
  telegramUser, 
  community, 
  activeTab,
  showEmailForm,
  isCheckingUserData,
  userExistsInDatabase
}) => {
  // Only show in development mode
  if (process.env.NODE_ENV !== 'development' && 
      window.location.hostname !== 'localhost' && 
      window.location.hostname !== '127.0.0.1') {
    return null;
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 p-2 rounded-md mb-4 text-xs">
      <h4 className="font-semibold">🔍 Debug Info</h4>
      <div className="grid grid-cols-2 gap-1">
        <div>User: {telegramUser ? `${telegramUser.first_name} (${telegramUser.id})` : 'None'}</div>
        <div>Community: {community ? community.name : 'None'}</div>
        <div>Email: {telegramUser?.email || 'None'}</div>
        <div>User in DB: {userExistsInDatabase === null ? 'Checking...' : userExistsInDatabase ? 'Yes' : 'No'}</div>
        <div>Active Tab: {activeTab}</div>
        <div>Show Email Form: {showEmailForm ? 'Yes' : 'No'}</div>
        <div>Checking User: {isCheckingUserData ? 'Yes' : 'No'}</div>
      </div>
    </div>
  );
};
