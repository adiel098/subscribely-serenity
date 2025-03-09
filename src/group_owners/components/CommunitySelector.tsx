
import { useNavigate } from "react-router-dom";
import { Bell, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCommunities } from "@/group_owners/hooks/useCommunities";
import { useCommunityContext } from "@/contexts/CommunityContext";
import { usePaymentMethods } from "@/group_owners/hooks/usePaymentMethods";
import { useSubscriptionPlans } from "@/group_owners/hooks/useSubscriptionPlans";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { CommunityDropdown } from "./community-selector/CommunityDropdown";
import { PlatformSubscriptionBanner } from "./community-selector/PlatformSubscriptionBanner";
import { MiniAppLinkButton } from "./community-selector/MiniAppLinkButton";
import { HeaderActions } from "./community-selector/HeaderActions";
import { AlertMessage } from "./community-selector/AlertMessage";

export const CommunitySelector = () => {
  const { data: communities } = useCommunities();
  const navigate = useNavigate();
  const { selectedCommunityId, setSelectedCommunityId } = useCommunityContext();
  const { toast } = useToast();
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const { data: paymentMethods } = usePaymentMethods(selectedCommunityId);
  const { plans } = useSubscriptionPlans(selectedCommunityId || "");

  const selectedCommunity = communities?.find(c => c.id === selectedCommunityId);
  const hasPlan = plans?.length > 0;

  const copyMiniAppLink = () => {
    if (!selectedCommunityId) {
      setAlertMessage("Please select a community first to copy the link 🎯");
      setShowAlert(true);
      return;
    }

    if (!plans?.length) {
      setAlertMessage("You haven't set up any subscription plans yet. Add at least one plan to share the link! 📦");
      setShowAlert(true);
      return;
    }

    if (!paymentMethods?.some(pm => pm.is_active)) {
      setAlertMessage("You haven't set up any active payment methods. Enable at least one payment method to share the link! 💳");
      setShowAlert(true);
      return;
    }

    const miniAppUrl = `https://t.me/membifybot?start=${selectedCommunityId}`;
    navigator.clipboard.writeText(miniAppUrl);
    
    toast({
      title: "✨ Link Copied Successfully! ✨",
      description: `Your Mini App link for "${selectedCommunity?.name || 'your community'}" is ready to share! 🚀`,
      className: "bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200 text-indigo-800 shadow-md",
      duration: 5000,
    });
  };

  return (
    <>
      <motion.div 
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="fixed top-16 left-0 right-0 z-10 flex items-center gap-4 px-6 py-2 bg-gradient-to-r from-white/90 to-gray-50/90 border-b backdrop-blur-lg transition-all duration-300 shadow-sm h-[60px]"
      >
        <div className="flex items-center gap-4 ml-[230px]">
          <CommunityDropdown 
            communities={communities} 
            selectedCommunityId={selectedCommunityId}
            setSelectedCommunityId={setSelectedCommunityId}
          />

          {/* The banner now manages its own visibility based on subscription status */}
          <PlatformSubscriptionBanner />

          <MiniAppLinkButton onClick={copyMiniAppLink} />
        </div>

        <HeaderActions onNewCommunityClick={() => navigate("/platform-select")} />
      </motion.div>

      <AlertMessage 
        showAlert={showAlert}
        setShowAlert={setShowAlert}
        alertMessage={alertMessage}
      />
    </>
  );
};
