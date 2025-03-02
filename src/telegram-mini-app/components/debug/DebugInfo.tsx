
import React from "react";
import { TelegramUser } from "@/telegram-mini-app/types/telegramTypes";
import { Community } from "@/telegram-mini-app/types/community.types";

interface DebugInfoProps {
  telegramUser: TelegramUser | null;
  community: Community;
  activeTab: string;
}

export const DebugInfo: React.FC<DebugInfoProps> = ({ telegramUser, community, activeTab }) => {
  if (process.env.NODE_ENV !== 'development') return null;
  
  return (
    <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 p-3 rounded mb-4 text-xs">
      <p><strong>Debug Info:</strong></p>
      <p>User ID: {telegramUser?.id || 'Not available'}</p>
      <p>Username: {telegramUser?.username || 'Not available'}</p>
      <p>Photo URL: {telegramUser?.photo_url || 'Not available'}</p>
      <p>Plans Count: {community.subscription_plans?.length || 0}</p>
      <p>Active Tab: {activeTab}</p>
    </div>
  );
};
