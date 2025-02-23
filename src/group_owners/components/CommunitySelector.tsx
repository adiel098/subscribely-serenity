import { useNavigate } from "react-router-dom";
import { Bell, Copy, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useCommunities } from "@/hooks/useCommunities";
import { useCommunityContext } from "@/contexts/CommunityContext";
import { usePaymentMethods } from "@/hooks/usePaymentMethods";
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

export const CommunitySelector = () => {
  const { data: communities } = useCommunities();
  const navigate = useNavigate();
  const { selectedCommunityId, setSelectedCommunityId } = useCommunityContext();
  const { toast } = useToast();
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const { data: paymentMethods } = usePaymentMethods(selectedCommunityId);
  const { plans } = useSubscriptionPlans(selectedCommunityId || "");

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
      <div className="fixed top-16 left-[280px] right-0 z-10 flex items-center gap-4 px-8 py-4 bg-white/80 border-b backdrop-blur-lg transition-all duration-300 shadow-sm">
        <div className="flex items-center gap-2">
          <Select value={selectedCommunityId || undefined} onValueChange={setSelectedCommunityId}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Select community" />
            </SelectTrigger>
            <SelectContent>
              {communities?.map(community => (
                <SelectItem key={community.id} value={community.id}>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={community.telegram_photo_url || undefined} />
                      <AvatarFallback className="bg-primary/5 text-primary/70">
                        {community.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {community.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button 
            onClick={copyMiniAppLink} 
            size="sm"
            variant="ghost"
            className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 gap-2"
          >
            <Copy className="h-4 w-4" />
            Copy Mini App Link
          </Button>
        </div>

        <div className="flex items-center gap-4 ml-auto">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="default" onClick={() => navigate("/platform-select")}>
            New Community
          </Button>
        </div>
      </div>

      <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <span>Attention</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-lg">
              {alertMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Got it</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
