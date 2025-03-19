
import React from "react";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      
      <Button 
        onClick={handleGoToDashboard}
        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 mt-4"
        size="lg"
      >
        Go to Dashboard
        <CheckCircle className="w-4 h-4" />
      </Button>
    </div>
  );
};
