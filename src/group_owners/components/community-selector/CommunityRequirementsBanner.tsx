import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Package, Copy, CheckCircle, Edit, Link, AlertTriangle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useCommunityContext } from "@/contexts/CommunityContext";
import { usePaymentMethods } from "@/group_owners/hooks/usePaymentMethods";
import { useSubscriptionPlans } from "@/group_owners/hooks/useSubscriptionPlans";
import { LinkEditDialog } from "./LinkEditDialog";
import { useCommunities } from "@/group_owners/hooks/useCommunities";

export const CommunityRequirementsBanner = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { selectedCommunityId, setSelectedCommunityId } = useCommunityContext();
  const [copySuccess, setCopySuccess] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [customLink, setCustomLink] = useState<string | null>(null);
  const { data: communities, refetch: refetchCommunities } = useCommunities();

  const { data: paymentMethods, isLoading: isLoadingPayments } = usePaymentMethods(selectedCommunityId);
  const { plans, isLoading: isLoadingPlans } = useSubscriptionPlans(selectedCommunityId || "");

  const selectedCommunity = communities?.find(community => community.id === selectedCommunityId);

  const hasActivePaymentMethods = paymentMethods?.some(pm => pm.is_active) || false;
  const hasPlans = (plans?.length || 0) > 0;
  const isFullyConfigured = hasActivePaymentMethods && hasPlans;
  const isLoading = isLoadingPayments || isLoadingPlans;

  const navigateToPaymentMethods = () => {
    navigate("/payment-methods");
  };

  const navigateToSubscriptions = () => {
    navigate("/subscriptions");
  };
  
  const navigateToSettings = () => {
    navigate("/bot-settings");
  };

  const copyMiniAppLink = () => {
    if (!selectedCommunityId) return;
    
    const miniAppUrl = selectedCommunity?.custom_link 
      ? `https://t.me/membifybot?start=${selectedCommunity.custom_link}`
      : `https://t.me/membifybot?start=${selectedCommunityId}`;
      
    navigator.clipboard.writeText(miniAppUrl)
      .then(() => {
        setCopySuccess(true);
        toast({
          title: "✨ Link Copied Successfully! ✨",
          description: "Your Mini App link is ready to share! 🚀",
          className: "bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200 text-indigo-800 shadow-md",
          duration: 3000,
        });
        
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch(err => {
        console.error("Failed to copy link: ", err);
        toast({
          title: "Copy failed",
          description: "Could not copy the link to clipboard",
          variant: "destructive",
        });
      });
  };

  const handleLinkUpdated = (newLink: string | null) => {
    setCustomLink(newLink);
    refetchCommunities();
  };

  const openEditDialog = () => {
    setIsEditDialogOpen(true);
  };

  if (isLoading || !selectedCommunityId) return null;

  return (
    <AnimatePresence mode="wait">
      {isFullyConfigured ? (
        <motion.div
          key="success"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 shadow-sm"
        >
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0 bg-emerald-100 rounded-full p-1">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
            </div>
            <span className="text-sm text-emerald-800">Your community is ready! 🎉</span>
          </div>
          
          <div className="flex items-center gap-2 ml-2 bg-white/70 rounded-md px-2 py-1 border border-emerald-100 min-w-[300px] max-w-[400px]">
            <Link className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
            <span className="text-xs text-emerald-700 font-mono truncate">
              t.me/membifybot?start={selectedCommunity?.custom_link || selectedCommunityId?.substring(0, 8) + "..."}
            </span>
          </div>
          
          <div className="flex items-center gap-1 ml-1">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={copyMiniAppLink}
              className={`flex items-center gap-1 text-xs px-2 py-1 rounded-md transition-colors ${
                copySuccess 
                  ? "bg-emerald-200 text-emerald-800" 
                  : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
              }`}
              title="Copy link"
            >
              {copySuccess ? (
                <CheckCircle className="h-3 w-3" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openEditDialog}
              className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
              title="Edit link"
            >
              <Edit className="h-3 w-3" />
            </motion.button>
          </div>
          
          <LinkEditDialog 
            isOpen={isEditDialogOpen}
            onClose={() => setIsEditDialogOpen(false)}
            communityId={selectedCommunityId}
            currentCustomLink={selectedCommunity?.custom_link || null}
            onLinkUpdated={handleLinkUpdated}
          />
        </motion.div>
      ) : (
        <motion.div
          key="requirements"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-3 bg-white/90 border border-red-300 rounded-lg px-3 py-2 shadow-sm"
        >
          <div className="flex-shrink-0 text-red-500">
            <AlertTriangle className="h-4 w-4" />
          </div>
          
          <div className="text-sm text-red-600 font-medium">
            <span>Setup required to onboard members</span>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {!hasPlans && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={navigateToSubscriptions} 
                  variant="ghost" 
                  size="sm" 
                  className="bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white gap-1 h-7 px-3 shadow-sm"
                >
                  <Package className="h-3.5 w-3.5" />
                  Plans
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </motion.div>
            )}
            
            {!hasActivePaymentMethods && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={navigateToPaymentMethods} 
                  variant="ghost" 
                  size="sm" 
                  className="bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white gap-1 h-7 px-3 shadow-sm"
                >
                  <CreditCard className="h-3.5 w-3.5" />
                  Payments
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
