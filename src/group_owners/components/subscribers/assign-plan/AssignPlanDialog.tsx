import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Subscriber } from "@/group_owners/hooks/useSubscribers";
import { addMonths, addYears, addDays } from "date-fns";
import { Check, Loader2 } from "lucide-react";
import { SubscriberInfo } from "./SubscriberInfo";
import { PlanSelector } from "./PlanSelector";
import { DurationSelector } from "./DurationSelector";
import { SubscriptionEndDate } from "./SubscriptionEndDate";
import { Plan } from "../AssignPlanDialog";
import { useIsMobile } from "@/hooks/use-mobile";

interface AssignPlanDialogProps {
  user: Subscriber | null;
  plans: Plan[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssign: (userId: string, planId: string, endDate: Date) => Promise<void>;
}

export const AssignPlanDialog = ({ 
  user, 
  plans, 
  open, 
  onOpenChange,
  onAssign
}: AssignPlanDialogProps) => {
  const isMobile = useIsMobile();
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [durationType, setDurationType] = useState<"1m" | "3m" | "6m" | "1y" | "custom">("1m");
  const [endDate, setEndDate] = useState<Date>(addMonths(new Date(), 1));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePlanChange = (planId: string) => {
    setSelectedPlanId(planId);
  };

  const handleDurationChange = (value: "1m" | "3m" | "6m" | "1y" | "custom") => {
    setDurationType(value);
    
    const today = new Date();
    switch (value) {
      case "1m":
        setEndDate(addMonths(today, 1));
        break;
      case "3m":
        setEndDate(addMonths(today, 3));
        break;
      case "6m":
        setEndDate(addMonths(today, 6));
        break;
      case "1y":
        setEndDate(addYears(today, 1));
        break;
      case "custom":
        // Keep current endDate
        break;
    }
  };

  const handleCustomDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    if (!isNaN(date.getTime())) {
      setEndDate(date);
    }
  };

  const selectedPlan = plans.find(plan => plan.id === selectedPlanId);

  const handleSubmit = async () => {
    if (!user || !selectedPlanId) return;
    
    setIsSubmitting(true);
    try {
      await onAssign(user.telegram_user_id, selectedPlanId, endDate);
      onOpenChange(false);
    } catch (error) {
      console.error("Error assigning plan:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] ${isMobile ? 'w-[95%] max-w-[350px] p-4' : 'sm:max-w-[475px]'}`}>
        <DialogHeader className={isMobile ? 'space-y-2 pb-2' : ''}>
          <DialogTitle className={isMobile ? 'text-lg' : ''}>Assign Subscription Plan</DialogTitle>
          <DialogDescription className={isMobile ? 'text-xs' : ''}>
            Assign a subscription plan to this user to grant them access to your content.
          </DialogDescription>
        </DialogHeader>
        
        {user && (
          <div className={`${isMobile ? 'space-y-3 py-1' : 'space-y-5 py-2'}`}>
            <SubscriberInfo user={user} />
            
            <div className={isMobile ? '[&_*]:!duration-0 [&_*]:!transition-none' : ''}>
              <PlanSelector 
                plans={plans} 
                selectedPlanId={selectedPlanId} 
                onPlanChange={handlePlanChange} 
              />
              
              <DurationSelector 
                durationType={durationType} 
                onDurationChange={handleDurationChange} 
                onCustomDateChange={handleCustomDateChange} 
                endDate={endDate} 
              />
              
              <SubscriptionEndDate 
                endDate={endDate} 
                selectedPlan={selectedPlan}
              />
            </div>
          </div>
        )}
        
        <DialogFooter className={`flex items-center ${isMobile ? 'justify-end gap-2 mt-3' : 'justify-between'}`}>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className={isMobile ? 'h-8 text-xs px-3' : ''}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!selectedPlanId || isSubmitting}
            className={`gap-2 ${isMobile ? 'h-8 text-xs px-3' : ''}`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} animate-spin`} />
                Assigning...
              </>
            ) : (
              <>
                <Check className={isMobile ? 'h-3 w-3' : 'h-4 w-4'} />
                Assign Plan
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
