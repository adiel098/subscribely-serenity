
import React from "react";
import { motion } from "framer-motion";
import { MessagesSquare, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
  // If not a group or no channels, don't render anything
  if (!isGroup || !channels || channels.length === 0) {
    console.log("Not rendering channels: isGroup=", isGroup, "channels=", channels?.length || 0);
    return null;
  }

  console.log("Rendering AvailableChannelsPreview with", channels.length, "channels");

  // Get emoji for channel based on its name
  const getChannelEmoji = (name: string) => {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes("vip")) return "⭐";
    if (lowerName.includes("premium")) return "💎";
    if (lowerName.includes("news")) return "📢";
    if (lowerName.includes("help")) return "🆘";
    if (lowerName.includes("chat")) return "💬";
    
    return "📱";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full mb-3"
    >
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100 p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <MessagesSquare className="h-4 w-4 text-indigo-600" />
            <h3 className="text-sm font-medium text-indigo-900">
              Subscription Includes
            </h3>
          </div>
          <Badge variant="outline" className="bg-white text-xs border-indigo-200 text-indigo-700 px-1.5 py-0">
            {channels.length} {channels.length === 1 ? 'Channel' : 'Channels'}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-1.5">
          {channels.map((channel) => (
            <div
              key={channel.id}
              className="bg-white rounded-md p-2 shadow-sm border border-indigo-100 flex items-center justify-between"
            >
              <div className="flex items-center gap-1 truncate">
                <span className="text-sm">{getChannelEmoji(channel.name)}</span>
                <p className="text-xs font-medium text-gray-900 truncate">
                  {channel.name}
                </p>
              </div>
              <Lock className="h-3 w-3 text-indigo-500 flex-shrink-0" />
            </div>
          ))}
        </div>

        <p className="text-xs text-indigo-700 text-center mt-2 bg-white/50 rounded-md p-1.5 border border-indigo-100">
          Join <span className="font-medium">{communityName}</span> to access all channels
        </p>
      </Card>
    </motion.div>
  );
};
