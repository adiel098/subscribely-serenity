
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
import { Badge } from "@/components/ui/badge";

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

  // Reset form when dialog opens
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Reset form when dialog closes
      setSelectedPlanId("");
      setSelectedDuration("monthly");
    }
    onOpenChange(open);
  };

  const getDurationLabel = (duration: string): string => {
    switch (duration) {
      case 'monthly': return 'Monthly (1 month)';
      case 'quarterly': return 'Quarterly (3 months)';
      case 'half-yearly': return 'Half-yearly (6 months)';
      case 'yearly': return 'Yearly (12 months)';
      default: return duration;
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-green-600" />
            Activate User Account
          </AlertDialogTitle>
          <AlertDialogDescription>
            Activate {user?.full_name || user?.email} and assign a subscription plan.
            {user && (
              <div className="mt-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                  {user.email}
                </Badge>
              </div>
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
                <SelectValue placeholder="Select duration">
                  {getDurationLabel(selectedDuration)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">{getDurationLabel('monthly')}</SelectItem>
                <SelectItem value="quarterly">{getDurationLabel('quarterly')}</SelectItem>
                <SelectItem value="half-yearly">{getDurationLabel('half-yearly')}</SelectItem>
                <SelectItem value="yearly">{getDurationLabel('yearly')}</SelectItem>
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
