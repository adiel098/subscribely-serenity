
import React from "react";
import { ConnectedChannelDisplay } from "../ConnectedChannelDisplay";

interface VerificationSuccessProps {
  community: {
    id: string;
    name: string;
    telegram_chat_id: string | null;
    telegram_photo_url?: string | null;
  };
  handleGoToDashboard: () => void;
  handleRefreshPhoto: (e: React.MouseEvent, communityId: string, chatId?: string | null) => void;
  isRefreshingPhoto: boolean;
}

export const VerificationSuccess: React.FC<VerificationSuccessProps> = ({
  community,
  handleGoToDashboard,
  handleRefreshPhoto,
  isRefreshingPhoto
}) => {
  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="w-full">
        <ConnectedChannelDisplay 
          community={community}
          onContinue={handleGoToDashboard}
          onRefreshPhoto={handleRefreshPhoto}
          isRefreshingPhoto={isRefreshingPhoto}
        />
      </div>
    </div>
  );
};
