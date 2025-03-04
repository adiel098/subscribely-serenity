
import { useNavigate } from "react-router-dom";
import { Bell, Copy, AlertCircle, PlusCircle, Sparkles, ChevronDown, Package, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useCommunities } from "@/group_owners/hooks/useCommunities";
import { useCommunityContext } from "@/contexts/CommunityContext";
import { usePaymentMethods } from "@/group_owners/hooks/usePaymentMethods";
import { useSubscriptionPlans } from "@/group_owners/hooks/useSubscriptionPlans";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

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

  const selectedCommunity = communities?.find(c => c.id === selectedCommunityId);
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
            <div>
              <p className="text-xs text-gray-500 font-medium">COMMUNITY</p>
              <Select value={selectedCommunityId || undefined} onValueChange={setSelectedCommunityId}>
                <SelectTrigger className="w-[200px] border-none p-0 h-auto shadow-none focus:ring-0 focus:ring-offset-0">
                  <div className="flex items-center gap-2">
                    {selectedCommunity ? (
                      <>
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={selectedCommunity.telegram_photo_url || undefined} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs">
                            {selectedCommunity.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-gray-800 text-sm truncate">{selectedCommunity.name}</span>
                      </>
                    ) : (
                      <span className="text-gray-400 text-sm">Select community</span>
                    )}
                    <ChevronDown className="h-3 w-3 ml-1 text-gray-400" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {communities?.map(community => (
                    <SelectItem key={community.id} value={community.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={community.telegram_photo_url || undefined} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs">
                            {community.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm truncate">{community.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {!hasPlatformPlan && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg shadow-sm"
            >
              <div className="flex items-center gap-2">
                <div className="flex-shrink-0 bg-amber-100 rounded-full p-1">
                  <Package className="h-4 w-4 text-amber-600" />
                </div>
                <p className="text-amber-800 text-sm">No active platform subscription 🔔</p>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    onClick={() => navigate("/platform-plans")} 
                    variant="ghost" 
                    size="sm" 
                    className="ml-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white gap-1 h-7 px-3 shadow-sm"
                  >
                    Upgrade 
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}

          {selectedCommunityId && !hasPlan && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg shadow-sm"
            >
              <div className="flex items-center gap-2">
                <div className="flex-shrink-0 bg-amber-100 rounded-full p-1">
                  <Package className="h-4 w-4 text-amber-600" />
                </div>
                <p className="text-amber-800 text-sm">No active subscription plans 🔔</p>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    onClick={navigateToPlans} 
                    variant="ghost" 
                    size="sm" 
                    className="ml-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white gap-1 h-7 px-3 shadow-sm"
                  >
                    Add Plan 
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              onClick={copyMiniAppLink} 
              size="sm"
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white gap-2 shadow-md hover:shadow-lg transition-all duration-300 text-xs py-1 h-8"
            >
              <Copy className="h-3 w-3" />
              Copy Mini App Link
            </Button>
          </motion.div>
        </div>

        <div className="flex items-center gap-4 ml-auto">
          <Button variant="ghost" size="icon" className="rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-300 h-8 w-8">
            <Bell className="h-4 w-4 text-gray-600" />
          </Button>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              variant="default" 
              onClick={() => navigate("/platform-select")}
              className="bg-gradient-to-r from-[#26A5E4] to-[#0088CC] hover:from-[#33C3F0] hover:to-[#0090BD] gap-2 shadow-md hover:shadow-lg transition-all duration-300 text-xs py-1 h-8"
              size="sm"
            >
              <PlusCircle className="h-3 w-3" />
              New Community
            </Button>
          </motion.div>
        </div>
      </motion.div>

      <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogContent className="border-none shadow-xl bg-white rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-xl">
              <AlertCircle className="h-6 w-6 text-orange-500" />
              <span>Attention</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-lg text-gray-600">
              {alertMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200 border-none transition-all duration-300">Got it</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
