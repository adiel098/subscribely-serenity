
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tv, Lock, Radio, MessagesSquare, ChevronDown, ChevronUp, Star, Shield, Zap, Info, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Card } from "@/components/ui/card";

interface ChannelInfo {
  id: string;
  name: string;
  type: "channel" | "group" | "bot" | "supergroup";
  description?: string;
}

interface AvailableChannelsPreviewProps {
  communityName: string;
  channels: ChannelInfo[];
  isGroup: boolean;
}

export const AvailableChannelsPreview: React.FC<AvailableChannelsPreviewProps> = ({
  communityName,
  channels,
  isGroup
}) => {
  const [isOpen, setIsOpen] = useState(true);
  
  // If not a group or no channels, don't render anything
  if (!isGroup || !channels || channels.length === 0) {
    console.log("Not rendering channels: isGroup=", isGroup, "channels=", channels?.length || 0);
    return null;
  }

  console.log("Rendering AvailableChannelsPreview with", channels.length, "channels");

  // Get appropriate emoji for channel type
  const getChannelEmoji = (name: string, type: string) => {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes("vip")) return "⭐";
    if (lowerName.includes("premium")) return "💎";
    if (lowerName.includes("news") || lowerName.includes("announcement")) return "📢";
    if (lowerName.includes("help") || lowerName.includes("support")) return "🆘";
    if (lowerName.includes("chat") || lowerName.includes("discussion")) return "💬";
    
    // Based on type
    if (type === "channel") return "📺";
    if (type === "bot") return "🤖";
    if (type === "supergroup") return "👥";
    
    return "📱";
  };

  // Get appropriate icon for channel type
  const getChannelIcon = (type: string, name: string) => {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes("vip") || lowerName.includes("premium")) return <Star className="h-3.5 w-3.5 text-amber-500" />;
    if (lowerName.includes("announcement") || lowerName.includes("news")) return <Radio className="h-3.5 w-3.5 text-purple-500" />;
    
    if (type === "channel") return <Tv className="h-3.5 w-3.5 text-blue-500" />;
    if (type === "bot") return <Zap className="h-3.5 w-3.5 text-green-500" />;
    if (type === "supergroup") return <Shield className="h-3.5 w-3.5 text-indigo-500" />;
    
    return <MessagesSquare className="h-3.5 w-3.5 text-purple-500" />;
  };

  // Maximum number of channels to show initially
  const maxInitialChannels = 3;
  const hasMoreChannels = channels.length > maxInitialChannels;
  const visibleChannels = isOpen ? channels : channels.slice(0, maxInitialChannels);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full mb-4"
    >
      <Card className="overflow-hidden bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MessagesSquare className="h-5 w-5 text-indigo-600" />
              <h3 className="font-semibold text-indigo-900">
                ✨ Subscription Includes Access To
              </h3>
            </div>
            <Badge variant="outline" className="bg-white border-indigo-200 text-indigo-700 px-2.5 py-0.5">
              {channels.length} {channels.length === 1 ? 'Channel' : 'Channels'}
            </Badge>
          </div>
          
          <div className="text-sm text-indigo-700 mb-4 bg-white/50 rounded-lg p-3 border border-indigo-100">
            <div className="flex gap-2 items-start">
              <Info className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
              <p>
                Join <span className="font-medium">{communityName}</span> to get access to all
                these exclusive channels with just one subscription!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 mb-2">
            <AnimatePresence>
              {visibleChannels.map((channel, index) => (
                <motion.div
                  key={channel.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="bg-white rounded-lg p-3 shadow-sm border border-indigo-100 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 bg-indigo-100 rounded-full p-2">
                      {getChannelIcon(channel.type, channel.name)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{getChannelEmoji(channel.name, channel.type)}</span>
                        <h4 className="font-medium text-gray-900">{channel.name}</h4>
                      </div>
                      {channel.description && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                          {channel.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="bg-indigo-50 rounded-full p-1.5">
                          <Lock className="h-3.5 w-3.5 text-indigo-600" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p className="text-xs">Unlock with subscription</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {hasMoreChannels && (
            <Collapsible
              open={isOpen}
              onOpenChange={setIsOpen}
              className="w-full"
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full border border-dashed border-indigo-200 hover:bg-indigo-50 text-indigo-700 flex items-center justify-center gap-1"
                >
                  {isOpen ? (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      <span>Show Less</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      <span>Show All {channels.length} Channels</span>
                    </>
                  )}
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent className="overflow-hidden">
                <div className="h-4"></div>
              </CollapsibleContent>
            </Collapsible>
          )}

          <div className="bg-gradient-to-r from-indigo-100/50 to-purple-100/50 rounded-lg p-3 mt-3 border border-indigo-100">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-gray-700">
                Subscribe once to gain access to all channels. Your membership will be automatically managed by our system.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
