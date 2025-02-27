
import { Check, ChevronRight, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import confetti from "canvas-confetti";

interface SuccessScreenProps {
  communityInviteLink: string | null;
}

export const SuccessScreen = ({ communityInviteLink }: SuccessScreenProps) => {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Trigger confetti effect when component mounts
    if (showConfetti) {
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#5EEAD4', '#0EA5E9', '#8B5CF6']
        });
        
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#5EEAD4', '#0EA5E9', '#8B5CF6']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();

      // Clean up confetti after animation
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, duration);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [showConfetti]);

  const handleJoinClick = () => {
    if (communityInviteLink) {
      window.open(communityInviteLink, '_blank');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-6 text-center animate-fade-up">
      <div className="relative">
        <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center shadow-sm">
          <Check className="w-10 h-10 text-green-600" />
        </div>
        <div className="absolute -top-2 -right-2">
          <PartyPopper className="w-8 h-8 text-primary" />
        </div>
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
        Payment Successful! 🎉
      </h2>
      
      <div className="space-y-2 max-w-sm">
        <p className="text-gray-600">
          Your payment has been processed successfully. You can now join the community.
        </p>
        <p className="text-sm text-gray-500">
          A confirmation has been sent to your Telegram account.
        </p>
      </div>
      
      {communityInviteLink ? (
        <div className="w-full max-w-sm">
          <Button
            size="lg"
            onClick={handleJoinClick}
            className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary transition-all group"
          >
            Join Community
            <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          <p className="mt-4 text-xs text-gray-500">
            By joining, you agree to the community's rules and guidelines.
          </p>
        </div>
      ) : (
        <div className="p-4 bg-red-50 rounded-lg border border-red-100 text-red-700 max-w-sm">
          <p className="font-medium">Error: No invite link available</p>
          <p className="text-sm mt-1">
            Please contact support or try refreshing the page.
          </p>
        </div>
      )}
    </div>
  );
};
