
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, ExternalLink, Copy, Check, ChevronDown, ChevronUp, MessagesSquare, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ChannelLink {
  id: string;
  name: string;
  inviteLink: string;
  description?: string;
  isMiniApp?: boolean;
  error?: string;
}

interface GroupChannelsLinksProps {
  groupName: string;
  channels: ChannelLink[];
}

export const GroupChannelsLinks = ({ groupName, channels }: GroupChannelsLinksProps) => {
  const [expanded, setExpanded] = useState(true);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);
  
  // Show only 5 channels initially, expand for more
  const showCollapsible = channels.length > 5;
  const initialChannels = showCollapsible ? channels.slice(0, 5) : channels;
  const remainingChannels = showCollapsible ? channels.slice(5) : [];

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

  // Render a single channel card - now more compact
  const renderChannelCard = (channel: ChannelLink) => {
    const emoji = getChannelEmoji(channel.name);
    const isMiniAppLink = channel.isMiniApp === true;
    const hasError = !!channel.error;
    
    return (
      <motion.div
        key={channel.id}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-2 mb-2 border border-indigo-100 dark:border-gray-700"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center min-w-0 gap-1.5">
            <span className="text-sm">{emoji}</span>
            <h3 className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
              {channel.name}
            </h3>
            {hasError && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <AlertCircle className="h-3 w-3 text-amber-500 flex-shrink-0" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    <p>Could not create direct invite link</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    className={`h-6 w-6 rounded-full ${isMiniAppLink ? 'bg-amber-500 hover:bg-amber-600' : 'bg-green-500 hover:bg-green-600'}`}
                    onClick={() => openLink(channel.inviteLink)}
                  >
                    <ExternalLink className="h-3 w-3 text-white" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  <p>{isMiniAppLink ? 'Subscribe to channel' : 'Join channel'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => copyLinkToClipboard(channel.inviteLink, channel.id)}
                    className="h-6 w-6 rounded-full border-indigo-200 dark:border-gray-600"
                  >
                    {copiedLinkId === channel.id ? (
                      <Check className="h-3 w-3 text-green-600" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  <p>Copy invite link</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <MessagesSquare className="h-4 w-4 text-indigo-600" />
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Group Channels
          </h3>
        </div>
        <Badge variant="secondary" className="text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
          {channels.length}
        </Badge>
      </div>
      
      <div className="rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 p-1">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
          <p className="text-xs text-center text-gray-600 dark:text-gray-300 mb-3">
            🎉 Access to <span className="font-medium text-indigo-600 dark:text-indigo-400">{groupName}</span> channels:
          </p>
          
          <div className="space-y-2">
            {/* Always show initial channels */}
            {initialChannels.map(renderChannelCard)}
            
            {/* Collapsible section for additional channels */}
            {showCollapsible && (
              <Collapsible open={expanded} onOpenChange={setExpanded} className="mt-1">
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full border-dashed border-indigo-200 dark:border-gray-700 flex items-center justify-center gap-1 py-1 text-xs text-indigo-600 dark:text-indigo-400"
                  >
                    {expanded ? (
                      <>
                        <ChevronUp className="h-3 w-3" />
                        <span>Show Less</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-3 w-3" />
                        <span>Show {remainingChannels.length} More</span>
                      </>
                    )}
                  </Button>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="mt-2">
                  <ScrollArea className={remainingChannels.length > 8 ? "h-44" : ""}>
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
      
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
        💡 Click the icons to join or copy invite links
      </p>
    </div>
  );
};
