
import React, { useEffect } from "react";
import { useInviteLink } from "./useInviteLink";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { CheckCircle2, LinkIcon, Copy } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export const SuccessScreen = ({ communityInviteLink }: { communityInviteLink: string | null }) => {
  const { inviteLink, isLoadingLink } = useInviteLink(communityInviteLink);
  const { toast } = useToast();
  
  console.log("Rendering success screen with invite link:", inviteLink);
  
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center px-4 py-10"
    >
      <Card className="w-full max-w-md p-8 bg-white shadow-lg rounded-xl">
        <div className="flex flex-col items-center text-center space-y-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="bg-green-100 p-4 rounded-full"
          >
            <CheckCircle2 size={60} className="text-green-600" />
          </motion.div>
          
          <h2 className="text-2xl font-bold text-gray-800">Payment Successful!</h2>
          
          <p className="text-gray-600">
            Your subscription has been activated successfully. Now you can join the community 
            using the button below.
          </p>
          
          <Button
            disabled={!inviteLink || isLoadingLink}
            onClick={handleJoinCommunity}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
            size="lg"
          >
            {isLoadingLink ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </span>
            ) : (
              "Join Community"
            )}
          </Button>
          
          {inviteLink && (
            <div className="w-full mt-4">
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-2 overflow-hidden">
                  <LinkIcon size={16} className="text-gray-500 flex-shrink-0" />
                  <span className="text-sm text-gray-600 truncate">{inviteLink}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={copyToClipboard}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Copy size={16} />
                </Button>
              </div>
            </div>
          )}
          
          <p className="text-sm text-gray-500">
            If you have any issues, please contact support.
          </p>
        </div>
      </Card>
    </motion.div>
  );
};
