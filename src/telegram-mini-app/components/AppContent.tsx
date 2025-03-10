
import React from "react";
import AppContent from "./app-content/AppContent";

interface TelegramMiniAppContentProps {
  communityId: string;
  telegramUserId?: string;
}

const TelegramMiniAppContent: React.FC<TelegramMiniAppContentProps> = ({ 
  communityId, 
  telegramUserId 
}) => {
  return (
    <AppContent 
      communityId={communityId} 
      telegramUserId={telegramUserId} 
    />
  );
};

export default TelegramMiniAppContent;
