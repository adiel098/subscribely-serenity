
import { Check, ChevronRight, PartyPopper, Copy, Link, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SuccessScreenProps {
  communityInviteLink: string | null;
}

export const SuccessScreen = ({ communityInviteLink }: SuccessScreenProps) => {
  const [showConfetti, setShowConfetti] = useState(true);
  const [inviteLink, setInviteLink] = useState<string | null>(communityInviteLink);
  const [isLoadingLink, setIsLoadingLink] = useState<boolean>(false);
  
  // Log the invite link for debugging
  useEffect(() => {
    console.log('Community invite link in SuccessScreen:', communityInviteLink);
    if (communityInviteLink) {
      setInviteLink(communityInviteLink);
    } else {
      // If no invite link is provided, try to fetch it from recent payments
      fetchInviteLinkFromRecentPayment();
    }
  }, [communityInviteLink]);

  // Attempt to fetch invite link from the most recent payment if not provided
  const fetchInviteLinkFromRecentPayment = async () => {
    if (inviteLink) return;
    
    setIsLoadingLink(true);
    try {
      console.log('Attempting to fetch invite link from recent payments...');
      
      // Try to get the most recent payment with an invite link
      const { data: recentPayment, error } = await supabase
        .from('subscription_payments')
        .select('invite_link, community_id')
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) {
        console.error('Error fetching recent payment:', error);
      } else if (recentPayment && recentPayment.length > 0 && recentPayment[0].invite_link) {
        console.log('Found invite link in recent payment:', recentPayment[0].invite_link);
        setInviteLink(recentPayment[0].invite_link);
      } else if (recentPayment && recentPayment.length > 0 && recentPayment[0].community_id) {
        // If we found a payment but no invite link, try to get the invite link from the community
        console.log('Found community ID in recent payment:', recentPayment[0].community_id);
        const { data: community, error: communityError } = await supabase
          .from('communities')
          .select('telegram_invite_link')
          .eq('id', recentPayment[0].community_id)
          .single();
        
        if (communityError) {
          console.error('Error fetching community:', communityError);
        } else if (community?.telegram_invite_link) {
          console.log('Found invite link in community:', community.telegram_invite_link);
          setInviteLink(community.telegram_invite_link);
        }
      }
    } catch (err) {
      console.error('Error in fetchInviteLinkFromRecentPayment:', err);
    } finally {
      setIsLoadingLink(false);
    }
  };

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
    if (inviteLink) {
      // Open the link in a new tab
      window.open(inviteLink, '_blank');
      
      // Also show a toast notification with the link
      toast({
        title: "Invite Link Ready",
        description: "Opening Telegram invite link...",
      });
    } else {
      toast({
        title: "No Invite Link",
        description: "Unable to find invite link. Please contact support.",
        variant: "destructive"
      });
    }
  };

  // Copy invite link to clipboard
  const handleCopyLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink)
        .then(() => {
          toast({
            title: "Link Copied",
            description: "Invite link copied to clipboard!",
          });
        })
        .catch(() => {
          toast({
            title: "Copy Failed",
            description: "Failed to copy link. Try manually copying it.",
            variant: "destructive"
          });
        });
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
      
      {isLoadingLink ? (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 text-blue-700 max-w-sm">
          <p className="font-medium">Loading invite link...</p>
          <p className="text-sm mt-1">
            Please wait while we retrieve your invite link.
          </p>
        </div>
      ) : inviteLink ? (
        <div className="w-full max-w-sm space-y-4">
          <Button
            size="lg"
            onClick={handleJoinClick}
            className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary transition-all group"
          >
            Join Community
            <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleCopyLink} 
            className="mt-2 w-full gap-2"
          >
            <Copy className="h-4 w-4" />
            Copy Invite Link
          </Button>
          
          <div className="mt-2 p-3 bg-gray-50 rounded-md border border-gray-200 text-xs break-all flex items-center space-x-2">
            <Link className="h-4 w-4 flex-shrink-0 text-primary" />
            <span className="font-mono text-gray-600 overflow-x-auto">{inviteLink}</span>
          </div>
          
          <p className="mt-4 text-xs text-gray-500">
            By joining, you agree to the community's rules and guidelines.
          </p>
        </div>
      ) : (
        <div className="p-4 bg-red-50 rounded-lg border border-red-100 text-red-700 max-w-sm">
          <div className="flex items-center gap-2 font-medium">
            <AlertTriangle className="h-5 w-5" />
            <p>No invite link available</p>
          </div>
          <p className="text-sm mt-1">
            We couldn't find an invite link for this community. Please contact support or try refreshing the page.
          </p>
          <Button 
            variant="outline" 
            className="mt-3 w-full text-red-600 border-red-200 hover:bg-red-50"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </Button>
        </div>
      )}
    </div>
  );
};
