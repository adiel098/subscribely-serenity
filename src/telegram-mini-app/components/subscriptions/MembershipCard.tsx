
import React, { useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Subscription } from "../../services/memberService";
import { isSubscriptionActive, getDaysRemaining } from "./utils";
import { useCommunityChannels } from "../../hooks/useCommunityChannels";
import { MembershipHeader } from "./membership-card/MembershipHeader";
import { MembershipTimeInfo } from "./membership-card/MembershipTimeInfo";
import { GroupChannelsSection } from "./membership-card/GroupChannelsSection";
import { MembershipActionButtons } from "./membership-card/MembershipActionButtons";
import { CancelSubscriptionConfirmation } from "./membership-card/CancelSubscriptionConfirmation";
import { createLogger } from "../../utils/debugUtils";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const logger = createLogger("MembershipCard");

interface MembershipCardProps {
  subscription: Subscription;
  onCancelClick: (subscription: Subscription) => void;
  onRenew: (subscription: Subscription) => void;
}

export const MembershipCard: React.FC<MembershipCardProps> = ({
  subscription,
  onCancelClick,
  onRenew,
}) => {
  const [cancelDialogOpen, setCancelDialogOpen] = React.useState(false);
  const [communityInviteLink, setCommunityInviteLink] = React.useState<string | null>(null);
  const active = isSubscriptionActive(subscription);
  const daysRemaining = getDaysRemaining(subscription);
  const isExpiringSoon = active && daysRemaining <= 3;
  
  // Fetch channels for groups
  const { channels, isGroup, isLoading } = useCommunityChannels(subscription.community_id);
  
  // Transform ChannelInfo to the format expected by GroupChannelsSection
  const formattedChannels = channels?.map(channel => ({
    id: channel.id,
    name: channel.name,
    inviteLink: channel.telegram_invite_link || '',
    isMiniApp: channel.type === 'bot',
    type: channel.type
  }));

  // Fetch invite link from subscription_payments if not available in subscription
  useEffect(() => {
    const fetchInviteLink = async () => {
      // Check if we already have an invite link from the subscription or community
      if (subscription.community?.telegram_invite_link || subscription.invite_link) {
        setCommunityInviteLink(subscription.community?.telegram_invite_link || subscription.invite_link);
        return;
      }

      try {
        logger.log(`Fetching invite link for community: ${subscription.community_id}`);
        
        // Try to get the invite link from subscription_payments
        const { data: payments, error } = await supabase
          .from('project_payments')
          .select('invite_link')
          .eq('project_id', subscription.community_id)
          .eq('telegram_user_id', subscription.telegram_user_id)
          .order('created_at', { ascending: false })
          .limit(1);
          
        if (error) {
          logger.error("Error fetching invite link from payments:", error);
          return;
        }
        
        if (payments && payments.length > 0 && payments[0].invite_link) {
          logger.log(`Found invite link in payment: ${payments[0].invite_link}`);
          setCommunityInviteLink(payments[0].invite_link);
        } else {
          logger.warn("No invite link found in payments");
        }
      } catch (error) {
        logger.error("Error in fetchInviteLink:", error);
      }
    };
    
    fetchInviteLink();
  }, [subscription]);

  const handleCommunityLink = () => {
    try {
      // Use the fetched invite link, or fallback to subscription data
      const inviteLink = communityInviteLink || 
                         subscription.community?.telegram_invite_link || 
                         subscription.invite_link || 
                         null;
                         
      if (inviteLink) {
        logger.log(`Opening community link: ${inviteLink.substring(0, 30)}...`);
        
        // Open the link in a new tab
        window.open(inviteLink, "_blank", "noopener,noreferrer");
        
        // Log success for debugging
        logger.log(`Successfully opened link: ${inviteLink}`);
      } else {
        toast({
          title: "No invite link",
          description: "No invite link is available for this community",
          variant: "destructive"
        });
      }
    } catch (error) {
      logger.error("Error opening community link:", error);
      toast({
        title: "Error opening link",
        description: "There was a problem opening the community link",
        variant: "destructive"
      });
    }
  };

  const handleRenew = () => {
    logger.log("[MembershipCard] Renewing subscription:", subscription.id);
    if (subscription.plan) {
      onRenew(subscription);
    } else {
      logger.error("[MembershipCard] Cannot renew: No plan found in subscription");
      toast({
        title: "Renewal error",
        description: "Cannot renew subscription: No plan information found",
        variant: "destructive"
      });
    }
  };

  const handleCancelConfirm = () => {
    onCancelClick(subscription);
    setCancelDialogOpen(false);
  };

  // Debug log to check for invite links
  useEffect(() => {
    logger.log("[MembershipCard] Subscription:", subscription);
    logger.log("[MembershipCard] Community ID:", subscription.community_id);
    logger.log("[MembershipCard] Community:", subscription.community);
    logger.log("[MembershipCard] Community invite link:", subscription.community?.telegram_invite_link);
    logger.log("[MembershipCard] Subscription invite link:", subscription.invite_link);
    logger.log("[MembershipCard] Fetched community invite link:", communityInviteLink);
    
    if (isGroup && channels?.length > 0) {
      logger.log("[MembershipCard] Group channels:", channels);
    }
  }, [subscription, channels, isGroup, communityInviteLink]);

  return (
    <>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem 
          value={subscription.id} 
          className={`border rounded-lg overflow-hidden mb-3 ${
            isExpiringSoon 
              ? "border-red-300 bg-red-50/30" 
              : active 
                ? "border-primary/20" 
                : "border-gray-200"
          }`}
        >
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <MembershipHeader subscription={subscription} />
          </AccordionTrigger>
          
          <AccordionContent className="px-4 pb-4">
            <div className="text-sm space-y-4">
              <MembershipTimeInfo subscription={subscription} />
              
              <GroupChannelsSection 
                isGroup={isGroup} 
                formattedChannels={formattedChannels}
                communityName={subscription.community?.name || "Community"}
                communityId={subscription.community_id}
                communityInviteLink={communityInviteLink || subscription.community?.telegram_invite_link || subscription.invite_link}
                onCommunityLinkClick={handleCommunityLink}
              />
              
              <MembershipActionButtons
                onCancelClick={() => setCancelDialogOpen(true)}
                onRenew={handleRenew}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      <CancelSubscriptionConfirmation
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        subscription={subscription}
        onCancelConfirm={handleCancelConfirm}
      />
    </>
  );
};
