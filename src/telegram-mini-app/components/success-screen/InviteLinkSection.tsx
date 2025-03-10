
import { Copy, Link, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";

interface InviteLinkSectionProps {
  inviteLink: string;
}

export const InviteLinkSection = ({ inviteLink }: InviteLinkSectionProps) => {
  const handleJoinClick = () => {
    // Open the link in a new tab
    window.open(inviteLink, '_blank');
    
    // Also show a toast notification with the link
    toast({
      title: "Opening Telegram Group 🚀",
      description: "Redirecting you to join the community now!",
    });
  };

  // Copy invite link to clipboard
  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink)
      .then(() => {
        toast({
          title: "Link Copied! 📋",
          description: "Invite link copied to your clipboard!",
        });
      })
      .catch(() => {
        toast({
          title: "Copy Failed",
          description: "Failed to copy link. Try manually copying it.",
          variant: "destructive"
        });
      });
  };

  return (
    <div className="w-full max-w-sm space-y-4">
      <motion.div
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="shadow-lg rounded-xl overflow-hidden"
      >
        <Button
          size="lg"
          onClick={handleJoinClick}
          className="w-full py-7 text-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 border-none transition-all group"
        >
          <div className="flex items-center gap-2">
            <span>Join Community 🚀</span>
            <ExternalLink className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Button>
      </motion.div>
      
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button 
          variant="outline" 
          onClick={handleCopyLink} 
          className="mt-2 w-full py-6 gap-2 text-purple-700 border-purple-200 bg-purple-50 hover:bg-purple-100 hover:text-purple-800 shadow-md"
        >
          <Copy className="h-4 w-4" />
          📋 Copy Invite Link
        </Button>
      </motion.div>
      
      <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-200 text-xs break-all flex items-center space-x-2">
        <Link className="h-4 w-4 flex-shrink-0 text-purple-500" />
        <span className="font-mono text-gray-600 overflow-x-auto">{inviteLink}</span>
      </div>
      
      <p className="mt-4 text-xs text-gray-500">
        By joining, you agree to the community's rules and guidelines. ✨
      </p>
    </div>
  );
};
