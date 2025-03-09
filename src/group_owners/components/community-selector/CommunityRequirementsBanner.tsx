
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Package, Copy, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useCommunityContext } from "@/contexts/CommunityContext";
import { usePaymentMethods } from "@/group_owners/hooks/usePaymentMethods";
import { useSubscriptionPlans } from "@/group_owners/hooks/useSubscriptionPlans";

export const CommunityRequirementsBanner = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { selectedCommunityId } = useCommunityContext();
  const [copySuccess, setCopySuccess] = useState(false);

  // Fetch payment methods and subscription plans
  const { data: paymentMethods, isLoading: isLoadingPayments } = usePaymentMethods(selectedCommunityId);
  const { plans, isLoading: isLoadingPlans } = useSubscriptionPlans(selectedCommunityId || "");

  // Check if community has active payment methods and plans
  const hasActivePaymentMethods = paymentMethods?.some(pm => pm.is_active) || false;
  const hasPlans = (plans?.length || 0) > 0;
  const isFullyConfigured = hasActivePaymentMethods && hasPlans;
  const isLoading = isLoadingPayments || isLoadingPlans;

  // Handle navigation to appropriate setup pages
  const navigateToPaymentMethods = () => {
    navigate("/payment-methods");
  };

  const navigateToSubscriptions = () => {
    navigate("/subscriptions");
  };

  // Copy mini app link functionality
  const copyMiniAppLink = () => {
    if (!selectedCommunityId) return;
    
    const miniAppUrl = `https://t.me/membifybot?start=${selectedCommunityId}`;
    navigator.clipboard.writeText(miniAppUrl)
      .then(() => {
        setCopySuccess(true);
        toast({
          title: "✨ Link Copied Successfully! ✨",
          description: "Your Mini App link is ready to share! 🚀",
          className: "bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200 text-indigo-800 shadow-md",
          duration: 3000,
        });
        
        // Reset success state after animation completes
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

  // If loading or no community selected, don't render
  if (isLoading || !selectedCommunityId) return null;

  return (
    <AnimatePresence mode="wait">
      {isFullyConfigured ? (
        // Success state - display the mini app link
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
          
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={copyMiniAppLink}
            className={`flex items-center gap-1.5 ml-2 text-sm px-3 py-1 rounded-md transition-colors ${
              copySuccess 
                ? "bg-emerald-200 text-emerald-800" 
                : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
            }`}
          >
            {copySuccess ? (
              <>
                <CheckCircle className="h-3.5 w-3.5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Mini App Link</span>
              </>
            )}
          </motion.button>
        </motion.div>
      ) : (
        // Requirements state - show what needs to be configured
        <motion.div
          key="requirements"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg px-3 py-2 shadow-sm"
        >
          <div className="text-sm text-amber-800">
            <span className="font-medium">Setup required 🔔</span>
            <span className="mx-1">•</span>
            <span>{!hasPlans && !hasActivePaymentMethods 
              ? "Add subscription plans & payment methods"
              : !hasPlans 
                ? "Add subscription plans" 
                : "Add payment methods"}
            </span>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {!hasPlans && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={navigateToSubscriptions} 
                  variant="ghost" 
                  size="sm" 
                  className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white gap-1 h-7 px-3 shadow-sm"
                >
                  <Package className="h-3.5 w-3.5" />
                  Subscription Plans
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
                  Payment Methods
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
