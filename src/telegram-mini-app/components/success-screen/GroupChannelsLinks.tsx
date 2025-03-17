
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, ExternalLink, Copy, Check, ChevronDown, ChevronUp, MessagesSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface ChannelLink {
  id: string;
  name: string;
  inviteLink: string;
  description?: string;
}

interface GroupChannelsLinksProps {
  groupName: string;
  channels: ChannelLink[];
}

export const GroupChannelsLinks = ({ groupName, channels }: GroupChannelsLinksProps) => {
  const [expanded, setExpanded] = useState(true);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);
  
  // Show only 3 channels initially, expand for more
  const showCollapsible = channels.length > 3;
  const initialChannels = showCollapsible ? channels.slice(0, 3) : channels;
  const remainingChannels = showCollapsible ? channels.slice(3) : [];

  const copyLinkToClipboard = (link: string, id: string) => {
    navigator.clipboard.writeText(link)
      .then(() => {
        setCopiedLinkId(id);
        toast({
          title: "✅ Link Copied!",
          description: "The invite link has been copied to your clipboard",
          duration: 3000,
        });
        
        // Reset copied state after 2 seconds
        setTimeout(() => setCopiedLinkId(null), 2000);
      })
      .catch(() => {
        toast({
          title: "Copy Failed",
          description: "Failed to copy link. Try again or copy it manually.",
          variant: "destructive"
        });
      });
  };

  const openLink = (link: string) => {
    window.open(link, "_blank");
  };

  // Emoji mapping for different types of channels
  const getChannelEmoji = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("news") || lowerName.includes("announcement")) return "📢";
    if (lowerName.includes("help") || lowerName.includes("support")) return "🆘";
    if (lowerName.includes("chat") || lowerName.includes("discussion")) return "💬";
    if (lowerName.includes("vip")) return "⭐";
    if (lowerName.includes("premium")) return "💎";
    return "📱";
  };

  // Render a single channel card
  const renderChannelCard = (channel: ChannelLink) => {
    const emoji = getChannelEmoji(channel.name);
    
    return (
      <motion.div
        key={channel.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-3 border border-indigo-100 dark:border-gray-700 hover:shadow-lg transition-all"
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 bg-indigo-100 dark:bg-indigo-900/40 w-10 h-10 rounded-full flex items-center justify-center text-xl">
            {emoji}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate pr-2">
                {channel.name}
              </h3>
              <Badge variant="outline" className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 text-xs">
                Channel
              </Badge>
            </div>
            
            {channel.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-2 line-clamp-2">
                {channel.description}
              </p>
            )}
            
            <div className="mt-3 flex space-x-2">
              <Button
                size="sm"
                onClick={() => openLink(channel.inviteLink)}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <ExternalLink className="h-3.5 w-3.5 mr-1" />
                Join
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyLinkToClipboard(channel.inviteLink, channel.id)}
                className="flex-none px-2 border-indigo-200 dark:border-gray-600"
              >
                {copiedLinkId === channel.id ? (
                  <Check className="h-3.5 w-3.5 text-green-600" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <MessagesSquare className="h-5 w-5 text-indigo-600" />
          <h3 className="font-medium text-gray-900 dark:text-gray-100">
            Group Channels
          </h3>
        </div>
        <Badge variant="secondary" className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
          {channels.length} {channels.length === 1 ? 'channel' : 'channels'}
        </Badge>
      </div>
      
      <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 p-1">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <p className="text-sm text-center text-gray-600 dark:text-gray-300 mb-4">
            🎉 Congratulations! You now have access to the following channels in <span className="font-semibold text-indigo-600 dark:text-indigo-400">{groupName}</span>:
          </p>
          
          <div className="space-y-3">
            {/* Always show initial channels */}
            {initialChannels.map(renderChannelCard)}
            
            {/* Collapsible section for additional channels */}
            {showCollapsible && (
              <Collapsible open={expanded} onOpenChange={setExpanded} className="mt-2">
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full border-dashed border-indigo-200 dark:border-gray-700 flex items-center justify-center gap-1 py-2 text-indigo-600 dark:text-indigo-400"
                  >
                    {expanded ? (
                      <>
                        <ChevronUp className="h-4 w-4" />
                        <span>Show Less</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        <span>Show {remainingChannels.length} More Channels</span>
                      </>
                    )}
                  </Button>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="mt-3">
                  <ScrollArea className={remainingChannels.length > 5 ? "h-60" : ""}>
                    <AnimatePresence>
                      {remainingChannels.map(renderChannelCard)}
                    </AnimatePresence>
                  </ScrollArea>
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        </div>
      </div>
      
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
        💡 Tip: Click "Join" to open each channel directly or copy the invite links to share with others.
      </p>
    </div>
  );
};
