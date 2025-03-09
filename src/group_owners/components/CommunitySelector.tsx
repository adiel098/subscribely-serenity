
import { useNavigate } from "react-router-dom";
import { Bell, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCommunities } from "@/group_owners/hooks/useCommunities";
import { useCommunityContext } from "@/contexts/CommunityContext";
import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { CommunityDropdown } from "./community-selector/CommunityDropdown";
import { PlatformSubscriptionBanner } from "./community-selector/PlatformSubscriptionBanner";
import { MiniAppLinkButton } from "./community-selector/MiniAppLinkButton";
import { HeaderActions } from "./community-selector/HeaderActions";
import { AlertMessage } from "./community-selector/AlertMessage";
import { CommunityRequirementsBanner } from "./community-selector/CommunityRequirementsBanner";

export const CommunitySelector = () => {
  const { data: communities } = useCommunities();
  const navigate = useNavigate();
  const { selectedCommunityId, setSelectedCommunityId } = useCommunityContext();
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

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

          {/* The platform subscription banner manages its own visibility */}
          <PlatformSubscriptionBanner />
          
          {/* New community requirements banner that replaces the MiniAppLinkButton */}
          <CommunityRequirementsBanner />
        </div>

        <HeaderActions onNewCommunityClick={() => navigate("/connect/telegram")} />
      </motion.div>

      <AlertMessage 
        showAlert={showAlert}
        setShowAlert={setShowAlert}
        alertMessage={alertMessage}
      />
    </>
  );
};
