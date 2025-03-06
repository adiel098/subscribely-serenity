
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, UserCheck } from "lucide-react";
import { AdminUser } from "@/admin/hooks/types/adminUsers.types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ActivateUserWithPlanDialogProps {
  user: AdminUser | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (planId: string, duration: string) => void;
  plans: { id: string; name: string }[];
  isLoading?: boolean;
}

export const ActivateUserWithPlanDialog = ({
  user,
  isOpen,
  onOpenChange,
  onConfirm,
  plans,
  isLoading = false,
}: ActivateUserWithPlanDialogProps) => {
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [selectedDuration, setSelectedDuration] = useState<string>("monthly");

  const handleConfirm = () => {
    onConfirm(selectedPlanId, selectedDuration);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Activate User Account</AlertDialogTitle>
          <AlertDialogDescription>
            Activate {user?.full_name || user?.email} and assign a subscription plan.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="plan">Subscription Plan</Label>
            <Select 
              value={selectedPlanId} 
              onValueChange={setSelectedPlanId}
            >
              <SelectTrigger id="plan" className="w-full">
                <SelectValue placeholder="Select a plan" />
              </SelectTrigger>
              <SelectContent>
                {plans.map(plan => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Subscription Duration</Label>
            <Select 
              value={selectedDuration} 
              onValueChange={setSelectedDuration}
            >
              <SelectTrigger id="duration" className="w-full">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly (3 months)</SelectItem>
                <SelectItem value="half-yearly">Half-yearly (6 months)</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm} 
            className="bg-green-600 hover:bg-green-700"
            disabled={isLoading || !selectedPlanId}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Activating...
              </>
            ) : (
              <>
                <UserCheck className="mr-2 h-4 w-4" />
                Activate User
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
