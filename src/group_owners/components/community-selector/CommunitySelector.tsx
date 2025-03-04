
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { useCommunities } from "@/group_owners/hooks/useCommunities";
import { useCommunityContext } from "@/contexts/CommunityContext";
import { usePaymentMethods } from "@/group_owners/hooks/usePaymentMethods";
import { useSubscriptionPlans } from "@/group_owners/hooks/useSubscriptionPlans";
import { supabase } from "@/integrations/supabase/client";

import { CommunityDropdown } from "./CommunityDropdown";
import { PlatformSubscriptionBanner } from "./PlatformSubscriptionBanner";
import { MissingPlanBanner } from "./MissingPlanBanner";
import { MiniAppLinkButton } from "./MiniAppLinkButton";
import { HeaderActions } from "./HeaderActions";
import { AlertMessage } from "./AlertMessage";

export const CommunitySelector = () => {
  const { data: communities } = useCommunities();
  const navigate = useNavigate();
  const { selectedCommunityId, setSelectedCommunityId } = useCommunityContext();
  const { toast } = useToast();
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [hasPlatformPlan, setHasPlatformPlan] = useState(true);

  const { data: paymentMethods } = usePaymentMethods(selectedCommunityId);
  const { plans } = useSubscriptionPlans(selectedCommunityId || "");

  const hasPlan = plans?.length > 0;

  // Check if the user has an active platform subscription
  useEffect(() => {
    const checkPlatformSubscription = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session?.session?.user?.id) return;
        
        const { data, error } = await supabase
          .from('platform_subscriptions')
          .select('*')
          .eq('user_id', session.session.user.id)
          .eq('is_active', true)
          .single();
        
        if (error || !data) {
          console.log('No active platform subscription found', error);
          setHasPlatformPlan(false);
        } else {
          console.log('Active platform subscription found', data);
          setHasPlatformPlan(true);
        }
      } catch (err) {
        console.error('Error checking platform subscription:', err);
      }
    };
    
    checkPlatformSubscription();
  }, []);

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
      title: "Link Copied! 🎉",
      description: "The Mini App link has been copied to your clipboard",
    });
  };

  const navigateToPlans = () => {
    navigate("/subscriptions");
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
          <div className="flex items-center gap-3 bg-white py-1 px-3 rounded-lg border shadow-sm">
            <Sparkles className="h-4 w-4 text-blue-500" />
            <CommunityDropdown 
              communities={communities}
              selectedCommunityId={selectedCommunityId}
              setSelectedCommunityId={setSelectedCommunityId}
            />
          </div>

          <PlatformSubscriptionBanner hasPlatformPlan={hasPlatformPlan} />

          <MissingPlanBanner 
            hasPlan={hasPlan} 
            selectedCommunityId={selectedCommunityId}
            navigateToPlans={navigateToPlans}
          />

          <MiniAppLinkButton onClick={copyMiniAppLink} />
        </div>

        <HeaderActions />
      </motion.div>

      <AlertMessage 
        showAlert={showAlert}
        setShowAlert={setShowAlert}
        alertMessage={alertMessage}
      />
    </>
  );
};
