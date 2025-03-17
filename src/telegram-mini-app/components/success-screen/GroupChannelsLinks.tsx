
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Copy, Check } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { createLogger } from "../../utils/debugUtils";

const logger = createLogger("GroupChannelsLinks");

interface Channel {
  id: string;
  name: string;
  inviteLink: string;
  isMiniApp?: boolean;
  error?: string;
}

interface GroupChannelsLinksProps {
  groupName: string;
  channels: Channel[];
}

export const GroupChannelsLinks: React.FC<GroupChannelsLinksProps> = ({ 
  groupName, 
  channels 
}) => {
  const { toast } = useToast();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  logger.log(`Rendering GroupChannelsLinks for ${groupName} with ${channels.length} channels`);
  channels.forEach((channel, index) => {
    logger.log(`Channel ${index + 1}: ${channel.name} - Link: ${channel.inviteLink.substring(0, 30)}... - isMiniApp: ${channel.isMiniApp || false}`);
  });

  if (!channels || channels.length === 0) {
    logger.log("No channels to display");
    return null;
  }

  const copyToClipboard = (link: string, index: number) => {
    navigator.clipboard.writeText(link)
      .then(() => {
        setCopiedIndex(index);
        toast({
          title: "Link Copied",
          description: "The invite link has been copied to your clipboard",
        });
        setTimeout(() => setCopiedIndex(null), 2000);
      })
      .catch(err => {
        logger.error("Failed to copy link: ", err);
        toast({
          title: "Copy Failed",
          description: "Could not copy link to clipboard",
          variant: "destructive",
        });
      });
  };

  const openLink = (link: string, name: string) => {
    logger.log(`Opening channel link for: ${name} - Link: ${link.substring(0, 30)}...`);
    window.open(link, "_blank");
  };

  return (
    <div className="w-full space-y-3">
      <h3 className="text-sm font-medium text-center mb-2">
        Your subscription includes access to these channels:
      </h3>

      {channels.map((channel, index) => (
        <Card 
          key={channel.id || index} 
          className="p-3 bg-white dark:bg-gray-800 shadow-sm border-indigo-100 dark:border-gray-700"
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">{channel.name}</h4>
              <span className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full">
                {channel.isMiniApp ? 'Mini App' : 'Channel'}
              </span>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={() => openLink(channel.inviteLink, channel.name)}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white h-8 py-0"
                size="sm"
              >
                <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                Join Channel
              </Button>
              
              <Button
                variant="outline"
                onClick={() => copyToClipboard(channel.inviteLink, index)}
                className="h-8 w-8 p-0 flex items-center justify-center"
                size="sm"
              >
                {copiedIndex === index ? (
                  <Check className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
