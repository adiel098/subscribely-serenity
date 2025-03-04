
import { useNavigate } from "react-router-dom";
import { Bell, Copy, AlertCircle, PlusCircle, Sparkles, ChevronDown, Star, Crown } from "lucide-react";
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
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

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

  return (
    <>
      <motion.div 
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="fixed top-16 left-0 right-0 z-10 flex items-center gap-4 px-8 py-4 bg-gradient-to-r from-white/95 via-indigo-50/90 to-purple-50/90 border-b backdrop-blur-lg transition-all duration-300 shadow-sm"
      >
        <div className="flex items-center gap-4 ml-8">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-3 bg-white py-2 px-3 rounded-lg border shadow-md"
          >
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600">
              <Crown className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-xs text-indigo-600 font-medium">ACTIVE COMMUNITY</p>
              <Select value={selectedCommunityId || undefined} onValueChange={setSelectedCommunityId}>
                <SelectTrigger className="w-[250px] border-none p-0 h-auto shadow-none focus:ring-0 focus:ring-offset-0">
                  <div className="flex items-center gap-2">
                    {selectedCommunity ? (
                      <>
                        <Avatar className="h-6 w-6 ring-2 ring-indigo-100">
                          <AvatarImage src={selectedCommunity.telegram_photo_url || undefined} />
                          <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                            {selectedCommunity.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-gray-800">{selectedCommunity.name}</span>
                      </>
                    ) : (
                      <span className="text-gray-400">Select community</span>
                    )}
                    <ChevronDown className="h-4 w-4 ml-1 text-gray-400" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {communities?.map(community => (
                    <SelectItem key={community.id} value={community.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={community.telegram_photo_url || undefined} />
                          <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                            {community.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {community.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              onClick={copyMiniAppLink} 
              size="sm"
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white gap-2 shadow-md hover:shadow-lg transition-all duration-300"
            >
              <Copy className="h-4 w-4" />
              Copy Mini App Link
            </Button>
          </motion.div>
        </div>

        <div className="flex items-center gap-4 ml-auto">
          <motion.div whileHover={{ scale: 1.1 }}>
            <Button variant="ghost" size="icon" className="rounded-full bg-white hover:bg-indigo-50 transition-all duration-300 shadow-sm">
              <Bell className="h-5 w-5 text-indigo-600" />
            </Button>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              variant="default" 
              onClick={() => navigate("/platform-select")}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 gap-2 shadow-md hover:shadow-lg transition-all duration-300"
            >
              <PlusCircle className="h-4 w-4" />
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
