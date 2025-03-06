
import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface ActivateUserWithPlanDialogProps {
  user: AdminUser | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (planId: string, duration: string, customDays?: number) => void;
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
  const [customDays, setCustomDays] = useState<number>(30);
  const [showCustomDaysInput, setShowCustomDaysInput] = useState<boolean>(false);

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      // Set default values if plans are available
      if (plans.length > 0) {
        setSelectedPlanId(plans[0].id);
      } else {
        setSelectedPlanId("");
      }
      setSelectedDuration("monthly");
      setCustomDays(30);
      setShowCustomDaysInput(false);
    }
  }, [isOpen, plans]);

  useEffect(() => {
    // When duration changes, update whether to show custom days input
    setShowCustomDaysInput(selectedDuration === "custom");
  }, [selectedDuration]);

  const handleConfirm = () => {
    if (selectedDuration === "custom") {
      onConfirm(selectedPlanId, selectedDuration, customDays);
    } else {
      onConfirm(selectedPlanId, selectedDuration);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Reset form when dialog closes
      setSelectedPlanId("");
      setSelectedDuration("monthly");
      setCustomDays(30);
      setShowCustomDaysInput(false);
    }
    onOpenChange(open);
  };

  const getDurationLabel = (duration: string): string => {
    switch (duration) {
      case 'monthly': return 'Monthly (1 month)';
      case 'quarterly': return 'Quarterly (3 months)';
      case 'half-yearly': return 'Half-yearly (6 months)';
      case 'yearly': return 'Yearly (12 months)';
      case 'custom': return 'Custom period';
      default: return duration;
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-green-600" />
            Activate User Account with Subscription
          </AlertDialogTitle>
          <AlertDialogDescription>
            {user ? (
              <>
                Activate {user.full_name || user.email} and assign a subscription plan.
                <div className="mt-2">
                  <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                    {user.email}
                  </Badge>
                </div>
              </>
            ) : (
              "Activate user and assign a subscription plan."
            )}
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
                {plans.length > 0 ? (
                  plans.map(plan => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="" disabled>
                    No plans available
                  </SelectItem>
                )}
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
                <SelectValue>
                  {getDurationLabel(selectedDuration)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">{getDurationLabel('monthly')}</SelectItem>
                <SelectItem value="quarterly">{getDurationLabel('quarterly')}</SelectItem>
                <SelectItem value="half-yearly">{getDurationLabel('half-yearly')}</SelectItem>
                <SelectItem value="yearly">{getDurationLabel('yearly')}</SelectItem>
                <SelectItem value="custom">{getDurationLabel('custom')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {showCustomDaysInput && (
            <div className="space-y-2">
              <Label htmlFor="customDays">Custom Period (days)</Label>
              <Input
                id="customDays"
                type="number"
                min="1"
                value={customDays}
                onChange={(e) => setCustomDays(Number(e.target.value))}
                className="w-full"
              />
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm} 
            className="bg-green-600 hover:bg-green-700"
            disabled={isLoading || !selectedPlanId || (selectedDuration === 'custom' && (!customDays || customDays < 1))}
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
