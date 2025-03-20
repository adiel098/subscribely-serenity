
import React from "react";
import { useInviteLink } from "./hooks/useInviteLink";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { GroupChannelsLinks } from "./GroupChannelsLinks";
import { InviteLinkSection } from "./InviteLinkSection";
import { LoadingSpinner } from "../LoadingSpinner";
import { createLogger } from "../../utils/debugUtils";

const logger = createLogger("SuccessScreen");

export const SuccessScreen = ({ communityInviteLink }: { communityInviteLink: string | null }) => {
  const { inviteLink, isLoadingLink, isGroup, groupName, channels } = useInviteLink(communityInviteLink);
  const { toast } = useToast();
  
  logger.log("Rendering success screen with invite link:", inviteLink);
  logger.log("Is group:", isGroup, "Group name:", groupName);
  logger.log("Channels count:", channels?.length || 0);
  
  if (channels && channels.length > 0) {
    logger.log("Channels details:");
    channels.forEach((channel, index) => {
      logger.log(`Channel ${index + 1}: ${channel.name || 'unnamed'} - Link: ${(channel.inviteLink || '').substring(0, 30)}... - isMiniApp: ${channel.isMiniApp || false}`);
    });
  }
  
  // Show loading state
  if (isLoadingLink) {
    return (
      <div className="flex flex-col items-center justify-center p-8 h-60">
        <LoadingSpinner size="lg" className="text-indigo-600" />
        <p className="mt-4 text-gray-600 dark:text-gray-300 text-center">
          Preparing your access links...
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center px-4 py-10"
    >
      <Card className="w-full max-w-md p-8 bg-white dark:bg-gray-800 shadow-lg rounded-xl">
        <div className="flex flex-col items-center text-center space-y-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full"
          >
            <CheckCircle2 size={60} className="text-green-600 dark:text-green-400" />
          </motion.div>
          
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Payment Successful! 🎉</h2>
          
          <p className="text-gray-600 dark:text-gray-300">
            Your subscription has been activated successfully. 
            {isGroup
              ? ` You now have access to all channels in the ${groupName} group.` 
              : " Now you can join the community using the button below."}
          </p>
          
          {isGroup && channels && channels.length > 0 ? (
            <GroupChannelsLinks 
              groupName={groupName} 
              channels={channels} 
            />
          ) : inviteLink ? (
            <InviteLinkSection inviteLink={inviteLink} />
          ) : (
            <div className="w-full p-6 bg-gray-50 dark:bg-gray-700/30 rounded-lg text-center">
              <p className="text-gray-500 dark:text-gray-400">
                No invite link available. Please contact support if you need assistance.
              </p>
            </div>
          )}
          
          <p className="text-sm text-gray-500 dark:text-gray-400">
            If you have any issues, please contact support.
          </p>
        </div>
      </Card>
    </motion.div>
  );
};
