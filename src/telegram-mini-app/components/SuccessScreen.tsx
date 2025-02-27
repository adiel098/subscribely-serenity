
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SuccessScreenProps {
  communityInviteLink: string | null;
}

export const SuccessScreen = ({ communityInviteLink }: SuccessScreenProps) => {
  const handleJoinClick = () => {
    if (!communityInviteLink) {
      console.error("No invite link available");
      return;
    }

    console.log("Opening community link:", communityInviteLink);
    
    // Format the link correctly for Telegram
    let formattedLink = communityInviteLink;
    
    // If the link doesn't start with 't.me' or 'https://t.me', ensure it's properly formatted
    if (!formattedLink.includes('t.me/')) {
      // If it's a joinchat link but missing the proper prefix
      if (formattedLink.startsWith('+')) {
        formattedLink = `https://t.me/joinchat/${formattedLink.substring(1)}`;
      } 
      // If it's just the invite code
      else if (!formattedLink.startsWith('https://') && !formattedLink.startsWith('http://')) {
        formattedLink = `https://t.me/${formattedLink}`;
      }
    }

    // Try to use Telegram's native APIs if available
    if (window.Telegram?.WebApp) {
      console.log("Using Telegram WebApp API with link:", formattedLink);
      
      // Try the recommended method first
      if (window.Telegram.WebApp.openTelegramLink) {
        window.Telegram.WebApp.openTelegramLink(formattedLink);
      }
      // Fall back to regular open link
      else if (window.Telegram.WebApp.openLink) {
        window.Telegram.WebApp.openLink(formattedLink);
      }
      // Last resort, use window.open
      else {
        window.open(formattedLink, '_blank');
      }
    } 
    // If Telegram API is not available, use regular window.open
    else {
      console.log("Telegram WebApp not available, using window.open");
      window.open(formattedLink, '_blank');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-6 text-center animate-fade-up">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
        <Check className="h-8 w-8 text-green-600" />
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
