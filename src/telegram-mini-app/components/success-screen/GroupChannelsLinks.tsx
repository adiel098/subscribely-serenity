
import React from "react";
import { ChannelLink } from "./types/inviteLink.types";
import { Link, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createLogger } from "../../utils/debugUtils";

const logger = createLogger("GroupChannelsLinks");

interface GroupChannelsLinksProps {
  groupName: string;
  channels: ChannelLink[];
}

export const GroupChannelsLinks = ({ groupName, channels }: GroupChannelsLinksProps) => {
  logger.log(`Rendering channels for group ${groupName}:`, channels);
  
  if (!channels || channels.length === 0) {
    return (
      <div className="w-full p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg text-center">
        <p className="text-gray-500 dark:text-gray-400">
          No channels available for this group.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center gap-2">
        <Link className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
        <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
          {`${groupName} Group Channels`}
        </span>
      </div>
      
      <div className="space-y-2">
        {channels.map((channel) => (
          <div 
            key={channel.id} 
            className="bg-white dark:bg-gray-800 rounded-md p-3 shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-800 dark:text-gray-200">
                {channel.name}
              </span>
              
              {channel.inviteLink ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs flex items-center gap-1"
                  onClick={() => window.open(channel.inviteLink!, "_blank")}
                >
                  <ExternalLink className="h-3 w-3" />
                  Join
                </Button>
              ) : (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  No link available
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
