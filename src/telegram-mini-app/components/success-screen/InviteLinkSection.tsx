
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, ExternalLink, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

interface InviteLinkSectionProps {
  inviteLink: string;
}

export const InviteLinkSection = ({ inviteLink }: InviteLinkSectionProps) => {
  const [copied, setCopied] = useState(false);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink)
      .then(() => {
        setCopied(true);
        toast({
          title: "Link Copied",
          description: "The invite link has been copied to your clipboard",
        });
        
        // Reset copied state after 2 seconds
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error("Failed to copy: ", err);
        toast({
          title: "Copy Failed",
          description: "Could not copy link to clipboard",
          variant: "destructive",
        });
      });
  };

  const openLink = () => {
    window.open(inviteLink, "_blank");
  };

  return (
    <div className="w-full p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <Link className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
        <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Community Invite Link</span>
      </div>
      
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-md p-2 shadow-sm">
        <div className="flex-1 truncate text-sm text-gray-600 dark:text-gray-300 px-2">
          {inviteLink}
        </div>
      </div>
      
      <div className="mt-3 flex space-x-2">
        <Button
          onClick={openLink}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Join Community
        </Button>
        
        <Button
          variant="outline"
          onClick={copyToClipboard}
          className="flex-none border-indigo-200 dark:border-gray-600"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
};
