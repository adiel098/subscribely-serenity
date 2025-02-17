import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useSubscriptionPlans } from "@/hooks/useSubscriptionPlans";
import { useCommunityContext } from "@/features/community/providers/CommunityContext";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

interface EditSubscriberDialogProps {
  subscriber: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const EditSubscriberDialog = ({
  subscriber,
  open,
  onOpenChange,
  onSuccess
}: EditSubscriberDialogProps) => {
  const { toast } = useToast();
  const { selectedCommunityId } = useCommunityContext();
  const { plans } = useSubscriptionPlans(selectedCommunityId || "");
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(subscriber?.subscription_plan_id || null);
  const [subscriptionStatus, setSubscriptionStatus] = useState(subscriber?.subscription_status || false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setSelectedPlanId(subscriber?.subscription_plan_id || null);
    setSubscriptionStatus(subscriber?.subscription_status || false);
  }, [subscriber]);

  const handleUpdateSubscriber = async () => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('telegram_chat_members')
        .update({
          subscription_plan_id: selectedPlanId,
          subscription_status: subscriptionStatus,
        })
        .eq('id', subscriber.id);

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update subscriber",
        });
      } else {
        toast({
          title: "Success",
          description: "Subscriber updated successfully",
        });
        onSuccess();
        onOpenChange(false);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update subscriber",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Edit Subscriber</AlertDialogTitle>
          <AlertDialogDescription>
            Make changes to the subscriber's plan and status.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="plan" className="text-right">
              Subscription Plan
            </Label>
            <Select value={selectedPlanId || undefined} onValueChange={setSelectedPlanId} disabled={isUpdating} className="col-span-3">
              <SelectTrigger>
                <SelectValue placeholder="Select a plan" />
              </SelectTrigger>
              <SelectContent>
                {plans?.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Subscription Status
            </Label>
            <div className="col-span-3 flex items-center space-x-2">
              <Input
                type="checkbox"
                id="status"
                checked={subscriptionStatus}
                onChange={(e) => setSubscriptionStatus(e.target.checked)}
                disabled={isUpdating}
              />
              <Label htmlFor="status" className="text-left">
                {subscriptionStatus ? "Active" : "Inactive"}
              </Label>
            </div>
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isUpdating}>Cancel</AlertDialogCancel>
          <Button onClick={handleUpdateSubscriber} disabled={isUpdating}>
            {isUpdating ? "Updating..." : "Update"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
