
import React, { useEffect, useState } from "react";
import { useInviteLink } from "./useInviteLink";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { GroupChannelsLinks } from "./GroupChannelsLinks";
import { InviteLinkSection } from "./InviteLinkSection";
import { LoadingSpinner } from "../LoadingSpinner";

interface ChannelLink {
  id: string;
  name: string;
  inviteLink: string;
  description?: string;
}

export const SuccessScreen = ({ communityInviteLink }: { communityInviteLink: string | null }) => {
  const { inviteLink, isLoadingLink } = useInviteLink(communityInviteLink);
  const { toast } = useToast();
  const [isGroup, setIsGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [channels, setChannels] = useState<ChannelLink[]>([]);
  const [isLoadingChannels, setIsLoadingChannels] = useState(false);
  
  console.log("Rendering success screen with invite link:", inviteLink);
  
  // Get links for all channels in the group
  useEffect(() => {
    const getGroupChannelLinks = async () => {
      if (!inviteLink) return;
      
      try {
        // Extract group ID or custom link from the invite link
        const startParamMatch = inviteLink.match(/start=([^&]+)/);
        if (!startParamMatch) return;
        
        const startParam = startParamMatch[1];
        console.log("Extracted start parameter:", startParam);
        
        setIsLoadingChannels(true);
        
        // Call create-invite-link function with the group ID
        const response = await supabase.functions.invoke('create-invite-link', {
          body: { 
            communityId: startParam
          }
        });
        
        if (response.error) {
          console.error("Error getting group channel links:", response.error);
          toast({
            title: "Error",
            description: "Failed to load channels. Please try again.",
            variant: "destructive"
          });
          setIsLoadingChannels(false);
          return;
        }
        
        // If response contains isGroup and channels, it's a group
        if (response.data?.isGroup && response.data?.channels) {
          setIsGroup(true);
          setGroupName(response.data.groupName || "Group");
          setChannels(response.data.channels);
          console.log("Loaded channels for group:", response.data.channels);
        }
        
        setIsLoadingChannels(false);
      } catch (error) {
        console.error("Error in getGroupChannelLinks:", error);
        setIsLoadingChannels(false);
      }
    };
    
    getGroupChannelLinks();
  }, [inviteLink, toast]);

  // Show loading state
  if (isLoadingLink || isLoadingChannels) {
    return (
      <div className="flex flex-col items-center justify-center p-8 h-60">
        <LoadingSpinner size="lg" className="text-indigo-600" />
        <p className="mt-4 text-gray-600 dark:text-gray-300 text-center">
          {isLoadingChannels ? "Loading group channels..." : "Preparing your access..."}
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
          
          {isGroup && channels.length > 0 ? (
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
