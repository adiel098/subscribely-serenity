
import React from "react";
import { ConfettiEffect } from "./ConfettiEffect";
import { SuccessHeader } from "./SuccessHeader";
import { InviteLinkSection } from "./InviteLinkSection";
import { LoadingLinkState } from "./LoadingLinkState";
import { NoLinkState } from "./NoLinkState";
import { useInviteLink } from "./useInviteLink";

interface SuccessScreenProps {
  communityInviteLink: string | null;
}

export const SuccessScreen = ({ communityInviteLink }: SuccessScreenProps) => {
  const { inviteLink, isLoadingLink } = useInviteLink(communityInviteLink);
  
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 md:px-8 space-y-6 text-center animate-fade-up">
      {/* Confetti effect that runs on mount */}
      <ConfettiEffect />
      
      {/* Success header with icon and messages */}
      <SuccessHeader />
      
      {/* Conditional rendering based on link status */}
      {isLoadingLink ? (
        <LoadingLinkState />
      ) : inviteLink ? (
        <InviteLinkSection inviteLink={inviteLink} />
      ) : (
        <NoLinkState />
      )}
    </div>
  );
};
