
import { Check, ChevronRight, PartyPopper, Copy, Link, AlertTriangle, Loader2 } from "lucide-react";
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
  const [retryCount, setRetryCount] = useState(0);
  
  // Enhanced logging
  useEffect(() => {
    console.log('🎉 SuccessScreen mounted');
    console.log('🔗 Initial invite link:', communityInviteLink);
  }, []);

  // Set initial link from props
  useEffect(() => {
    console.log('🔗 Props invite link in SuccessScreen:', communityInviteLink);
    if (communityInviteLink) {
      console.log('✅ Setting invite link from props');
      setInviteLink(communityInviteLink);
    } else {
      console.log('⚠️ No invite link in props, will try to fetch');
      // If no invite link is provided, try to fetch it from recent payments
      fetchInviteLinkFromRecentPayment();
    }
  }, [communityInviteLink]);

  // Try the edge function as a fallback
  const fetchInviteLinkFromEdgeFunction = async (communityId: string) => {
    console.log('🔄 Attempting to fetch invite link from edge function for community:', communityId);
    try {
      const response = await supabase.functions.invoke("telegram-community-data", {
        body: { 
          community_id: communityId, 
          debug: true,
          operation: "get_invite_link"
        }
      });
      
      console.log('📥 Edge function response:', response);
      
      if (response.data?.invite_link) {
        console.log('✅ Retrieved invite link from edge function:', response.data.invite_link);
        setInviteLink(response.data.invite_link);
        return true;
      } else if (response.data?.community?.telegram_invite_link) {
        console.log('✅ Retrieved invite link from community data:', response.data.community.telegram_invite_link);
        setInviteLink(response.data.community.telegram_invite_link);
        return true;
      }
      
      console.warn('⚠️ No invite link in edge function response');
      return false;
    } catch (err) {
      console.error("❌ Error fetching invite link from edge function:", err);
      return false;
    }
  };
  
  // Try to create a new invite link
  const createNewInviteLink = async (communityId: string) => {
    console.log('🔄 Attempting to create new invite link for community:', communityId);
    try {
      const response = await supabase.functions.invoke("create-invite-link", {
        body: { community_id: communityId }
      });
      
      console.log('📥 Create invite link response:', response);
      
      if (response.data?.invite_link) {
        console.log('✅ Created new invite link:', response.data.invite_link);
        setInviteLink(response.data.invite_link);
        return true;
      }
      
      console.warn('⚠️ Failed to create new invite link');
      return false;
    } catch (err) {
      console.error("❌ Error creating new invite link:", err);
      return false;
    }
  };
  
  // Attempt to fetch invite link from the most recent payment
  const fetchInviteLinkFromRecentPayment = async () => {
    if (inviteLink) {
      console.log('✅ Already have invite link, skipping fetch');
      return;
    }
    
    setIsLoadingLink(true);
    try {
      console.log('🔄 Attempting to fetch invite link from recent payments...');
      
      // Try to get the most recent payment with an invite link
      const { data: recentPayment, error } = await supabase
        .from('subscription_payments')
        .select('invite_link, community_id, plan_id')
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) {
        console.error('❌ Error fetching recent payment:', error);
      } else if (recentPayment && recentPayment.length > 0) {
        console.log('📥 Found recent payment:', recentPayment[0]);
        
        if (recentPayment[0].invite_link) {
          console.log('✅ Found invite link in recent payment:', recentPayment[0].invite_link);
          setInviteLink(recentPayment[0].invite_link);
          return;
        } else if (recentPayment[0].community_id) {
          // If we found a payment but no invite link, try to get the invite link from the community
          console.log('🔍 Found community ID in recent payment:', recentPayment[0].community_id);
          const { data: community, error: communityError } = await supabase
            .from('communities')
            .select('telegram_invite_link')
            .eq('id', recentPayment[0].community_id)
            .single();
          
          if (communityError) {
            console.error('❌ Error fetching community:', communityError);
          } else if (community?.telegram_invite_link) {
            console.log('✅ Found invite link in community:', community.telegram_invite_link);
            setInviteLink(community.telegram_invite_link);
            return;
          } else {
            console.log('⚠️ No invite link in community, trying edge function');
            // Try the edge function
            const gotLinkFromEdgeFunction = await fetchInviteLinkFromEdgeFunction(recentPayment[0].community_id);
            
            if (!gotLinkFromEdgeFunction && retryCount < 2) {
              console.log('⚠️ No invite link from edge function, trying to create a new one');
              // Try to create a new invite link
              await createNewInviteLink(recentPayment[0].community_id);
            }
          }
        }
      } else {
        console.warn('⚠️ No recent payments found');
      }
    } catch (err) {
      console.error('❌ Error in fetchInviteLinkFromRecentPayment:', err);
    } finally {
      setIsLoadingLink(false);
      setRetryCount(prevCount => prevCount + 1);
    }
  };

  const handleRetryFetchLink = () => {
    console.log('🔄 Manually retrying invite link fetch');
    setIsLoadingLink(true);
    fetchInviteLinkFromRecentPayment();
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
      console.log('🔗 Opening invite link:', inviteLink);
      // Open the link in a new tab
      window.open(inviteLink, '_blank');
      
      // Also show a toast notification with the link
      toast({
        title: "Invite Link Ready",
        description: "Opening Telegram invite link...",
      });
    } else {
      console.warn('⚠️ Attempted to join but no invite link available');
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
      console.log('📋 Copying invite link to clipboard');
      navigator.clipboard.writeText(inviteLink)
        .then(() => {
          toast({
            title: "Link Copied",
            description: "Invite link copied to clipboard!",
          });
        })
        .catch((err) => {
          console.error('❌ Error copying to clipboard:', err);
          toast({
            title: "Copy Failed",
            description: "Failed to copy link. Try manually copying it.",
            variant: "destructive"
          });
        });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-6 text-center animate-fade-up">
      <div className="relative">
        <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center shadow-sm">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <div className="absolute -top-2 -right-2">
          <PartyPopper className="w-6 h-6 text-primary" />
        </div>
      </div>
      
      <h2 className="text-xl font-bold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
        Payment Successful! 🎉
      </h2>
      
      <div className="space-y-2 max-w-xs text-sm">
        <p className="text-gray-600">
          Your payment has been processed successfully. You can now join the community.
        </p>
      </div>
      
      {isLoadingLink ? (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 text-blue-700 max-w-xs">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <p className="font-medium">Loading invite link...</p>
          </div>
          <p className="text-xs mt-1">
            Please wait while we retrieve your invite link.
          </p>
        </div>
      ) : inviteLink ? (
        <div className="w-full max-w-xs space-y-3">
          <div className="p-3 bg-green-50 rounded-md border border-green-200 text-green-700 mb-2">
            <p className="font-medium text-sm">Your Invite Link is Ready!</p>
            <p className="text-xs mt-1">Click the button below to join the community</p>
          </div>
          
          <Button
            size="lg"
            onClick={handleJoinClick}
            className="w-full py-4 text-base font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary transition-all group"
          >
            Join Community
            <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleCopyLink} 
            className="mt-2 w-full gap-2 text-sm"
          >
            <Copy className="h-3 w-3" />
            Copy Invite Link
          </Button>
          
          <div className="mt-2 p-2 bg-gray-50 rounded-md border border-gray-200 text-xs break-all flex items-center space-x-2">
            <Link className="h-3 w-3 flex-shrink-0 text-primary" />
            <span className="font-mono text-gray-600 overflow-x-auto text-xs">{inviteLink}</span>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-red-50 rounded-lg border border-red-100 text-red-700 max-w-xs">
          <div className="flex items-center gap-2 font-medium">
            <AlertTriangle className="h-4 w-4" />
            <p className="text-sm">No invite link available</p>
          </div>
          <p className="text-xs mt-1">
            We couldn't find an invite link for this community. Please try the button below or contact support.
          </p>
          <Button 
            variant="outline" 
            className="mt-3 w-full text-red-600 border-red-200 hover:bg-red-50 text-sm"
            onClick={handleRetryFetchLink}
            disabled={isLoadingLink}
          >
            {isLoadingLink ? (
              <>
                <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                Trying...
              </>
            ) : (
              <>Retry Getting Link</>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
