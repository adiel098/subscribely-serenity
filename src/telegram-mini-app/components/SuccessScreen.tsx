
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SuccessScreenProps {
  communityInviteLink: string | null;
}

export const SuccessScreen = ({ communityInviteLink }: SuccessScreenProps) => {
  const handleJoinClick = () => {
    if (communityInviteLink) {
      // Try to use Telegram WebApp to open the link if available
      if (window.Telegram && window.Telegram.WebApp) {
        window.open(communityInviteLink, '_blank');
      } else {
        // Fallback to regular window.open
        window.open(communityInviteLink, '_blank');
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-6 text-center animate-fade-up">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
        <Check className="w-8 h-8 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900">
        Payment Successful!
      </h2>
      <p className="text-gray-600 max-w-sm">
        Your payment has been processed. Click the button below to join the community.
      </p>
      {communityInviteLink ? (
        <Button
          size="lg"
          onClick={handleJoinClick}
          className="px-8 py-6 text-lg font-semibold"
        >
          Join Community
        </Button>
      ) : (
        <p className="text-red-500">
          Error: No invite link available. Please contact support.
        </p>
      )}
    </div>
  );
};
