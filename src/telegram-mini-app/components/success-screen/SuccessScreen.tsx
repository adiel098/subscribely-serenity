
import React, { useEffect, useState } from "react";
import { useInviteLink } from "./useInviteLink";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { CheckCircle2, LinkIcon, Copy } from "lucide-react";
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
  
  // Extract community ID from the invite link
  useEffect(() => {
    const fetchCommunityDetails = async () => {
      if (!inviteLink) return;
      
      try {
        // Extract community ID from link or URL parameters
        const communityIdMatch = inviteLink.match(/start=([^&]+)/);
        if (!communityIdMatch) return;
        
        const communityId = communityIdMatch[1];
        console.log("Extracted community ID:", communityId);
        
        // Fetch community details to check if it's a group
        const { data: community, error } = await supabase
          .from('communities')
          .select('id, name, is_group')
          .eq('id', communityId)
          .single();
          
        if (error) throw error;
        
        if (community?.is_group) {
          setIsGroup(true);
          setGroupName(community.name || "Group");
          
          // Fetch group channels
          setIsLoadingChannels(true);
          const { data: relationships, error: relError } = await supabase
            .from('community_relationships')
            .select('member_id, display_order')
            .eq('community_id', communityId)
            .eq('relationship_type', 'group')
            .order('display_order', { ascending: true });
            
          if (relError) throw relError;
          
          if (relationships && relationships.length > 0) {
            // Get community details for each related channel
            const memberIds = relationships.map(rel => rel.member_id);
            
            const { data: channelCommunities, error: channelsError } = await supabase
              .from('communities')
              .select('id, name, description, custom_link')
              .in('id', memberIds);
              
            if (channelsError) throw channelsError;
            
            // For each channel community, get or generate invite link
            const channelsWithLinks: ChannelLink[] = [];
            
            for (const channel of channelCommunities || []) {
              // Try to get stored invite link
              let channelInviteLink;
              
              if (channel.custom_link) {
                channelInviteLink = `https://t.me/MembifyBot?start=${channel.custom_link}`;
              } else {
                channelInviteLink = `https://t.me/MembifyBot?start=${channel.id}`;
              }
              
              channelsWithLinks.push({
                id: channel.id,
                name: channel.name,
                inviteLink: channelInviteLink,
                description: channel.description
              });
            }
            
            // Sort channels according to the original relationship display_order
            channelsWithLinks.sort((a, b) => {
              const aOrder = relationships.find(r => r.member_id === a.id)?.display_order || 0;
              const bOrder = relationships.find(r => r.member_id === b.id)?.display_order || 0;
              return aOrder - bOrder;
            });
            
            setChannels(channelsWithLinks);
          }
          setIsLoadingChannels(false);
        }
      } catch (err) {
        console.error("Error fetching community details:", err);
        setIsLoadingChannels(false);
      }
    };
    
    fetchCommunityDetails();
  }, [inviteLink]);
  
  // Copy link to clipboard functionality
  const copyToClipboard = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink)
        .then(() => {
          toast({
            title: "Link Copied",
            description: "Invite link copied to clipboard",
          });
          
          // Trigger haptic feedback if available in Telegram Mini App
          if (window.Telegram?.WebApp?.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
          }
        })
        .catch(err => {
          console.error("Failed to copy text: ", err);
          toast({
            title: "Copy Failed",
            description: "Could not copy link to clipboard",
            variant: "destructive",
          });
        });
    }
  };

  const handleJoinCommunity = () => {
    if (inviteLink) {
      console.log("Opening invite link:", inviteLink);
      window.open(inviteLink, "_blank");
    }
  };

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
