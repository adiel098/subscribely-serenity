
import React, { useState } from "react";
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
    <div className="w-full space-y-2">
      <h3 className="text-sm font-medium text-center mb-2">
        Your subscription includes access to these channels:
      </h3>

      {channels.map((channel, index) => (
        <div 
          key={channel.id || index} 
          className="p-3 bg-white border border-green-200 rounded-lg shadow-sm flex items-center justify-between"
        >
          <span className="text-sm font-medium text-gray-800 truncate mr-2">
            {channel.name}
          </span>
          
          <div className="flex gap-1.5">
            <Button
              onClick={() => openLink(channel.inviteLink, channel.name)}
              className="h-7 w-7 p-0 bg-green-50 hover:bg-green-100 border border-green-200 text-green-600"
              size="sm"
              variant="outline"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
            
            <Button
              variant="outline"
              onClick={() => copyToClipboard(channel.inviteLink, index)}
              className="h-7 w-7 p-0 bg-green-50 hover:bg-green-100 border border-green-200 text-green-600"
              size="sm"
            >
              {copiedIndex === index ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
