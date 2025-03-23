
import React from "react";
import { ConnectedChannelDisplay } from "../ConnectedChannelDisplay";

interface VerificationSuccessProps {
  community: {
    id: string;
    name: string;
    telegram_chat_id: string | null;
    telegram_photo_url?: string | null;
  };
  onComplete: () => void;  // Added this prop to match usage in ConnectTelegramStep
  isRefreshingPhoto: boolean;
  onRefreshPhoto: (e: React.MouseEvent, communityId: string, chatId?: string | null) => void;
}

export const VerificationSuccess: React.FC<VerificationSuccessProps> = ({
  community,
  onComplete,
  isRefreshingPhoto,
  onRefreshPhoto
}) => {
  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="w-full">
        <ConnectedChannelDisplay 
          community={community}
          onContinue={onComplete}
          onRefreshPhoto={onRefreshPhoto}
          isRefreshingPhoto={isRefreshingPhoto}
        />
      </div>
    </div>
  );
};
