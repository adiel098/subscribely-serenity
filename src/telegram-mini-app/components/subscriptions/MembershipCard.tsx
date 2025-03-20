import React from "react";
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
  const active = isSubscriptionActive(subscription);
  const daysRemaining = getDaysRemaining(subscription);
  const isExpiringSoon = active && daysRemaining <= 3;
  
  // Fetch channels for groups
  const { channels, isGroup, isLoading } = useCommunityChannels(subscription.community_id);
  
  // Transform ChannelInfo to the format expected by GroupChannelsSection
  const formattedChannels = channels?.map(channel => ({
    id: channel.id,
    name: channel.name,
    inviteLink: channel.telegram_invite_link || subscription.community.telegram_invite_link || '',
    isMiniApp: channel.type === 'bot',
    type: channel.type
  }));

  const handleCommunityLink = () => {
    if (subscription.community.telegram_invite_link) {
      window.open(subscription.community.telegram_invite_link, "_blank");
    }
  };

  const handleRenew = () => {
    console.log("[MembershipCard] Renewing subscription:", subscription.id);
    if (subscription.plan) {
      onRenew(subscription);
    } else {
      console.error("[MembershipCard] Cannot renew: No plan found in subscription");
    }
  };

  const handleCancelConfirm = () => {
    onCancelClick(subscription);
    setCancelDialogOpen(false);
  };

  // Debug log to check for invite links
  React.useEffect(() => {
    console.log("[MembershipCard] Subscription community:", subscription.community);
    console.log("[MembershipCard] Community invite link:", subscription.community.telegram_invite_link);
    if (isGroup && channels?.length > 0) {
      console.log("[MembershipCard] Group channels:", channels);
    }
  }, [subscription, channels, isGroup]);

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
                communityName={subscription.community.name}
                communityInviteLink={subscription.community.telegram_invite_link}
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
