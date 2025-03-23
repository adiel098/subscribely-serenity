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
import { useState } from "react";
import { CalendarClock, Check, ChevronDown, Clock, CreditCard } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, addMonths, addYears, addDays } from "date-fns";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface Plan {
  id: string;
  name: string;
  price: number;
  interval: string;
}

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
      <DialogContent className="sm:max-w-[475px]">
        <DialogHeader>
          <DialogTitle>Assign Subscription Plan</DialogTitle>
          <DialogDescription>
            Assign a subscription plan to this user to grant them access to your content.
          </DialogDescription>
        </DialogHeader>
        
        {user && (
          <div className="space-y-5 py-2">
            <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <CreditCard className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium">Assigning plan to:</h3>
                <p className="text-sm text-gray-700">
                  {user.first_name} {user.last_name} 
                  {user.telegram_username ? ` (@${user.telegram_username})` : ''}
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="plan-select">Select Subscription Plan</Label>
              <Select value={selectedPlanId} onValueChange={handlePlanChange}>
                <SelectTrigger id="plan-select" className="w-full">
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      <div className="flex justify-between items-center w-full">
                        <span>{plan.name}</span>
                        <span className="text-gray-500">${plan.price} / {plan.interval}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-3">
              <Label>Subscription Duration</Label>
              <RadioGroup 
                value={durationType} 
                onValueChange={(val) => handleDurationChange(val as "1m" | "3m" | "6m" | "1y" | "custom")}
                className="grid grid-cols-5 gap-3"
              >
                <div>
                  <RadioGroupItem value="1m" id="duration-1m" className="peer sr-only" />
                  <Label
                    htmlFor="duration-1m"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <span className="text-xs font-medium">1 Month</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="3m" id="duration-3m" className="peer sr-only" />
                  <Label
                    htmlFor="duration-3m"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <span className="text-xs font-medium">3 Months</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="6m" id="duration-6m" className="peer sr-only" />
                  <Label
                    htmlFor="duration-6m"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <span className="text-xs font-medium">6 Months</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="1y" id="duration-1y" className="peer sr-only" />
                  <Label
                    htmlFor="duration-1y"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <span className="text-xs font-medium">1 Year</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="custom" id="duration-custom" className="peer sr-only" />
                  <Label
                    htmlFor="duration-custom"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <span className="text-xs font-medium">Custom</span>
                  </Label>
                </div>
              </RadioGroup>
              
              {durationType === "custom" && (
                <div className="pt-2">
                  <Label htmlFor="custom-date">End Date</Label>
                  <input
                    type="date"
                    id="custom-date"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min={format(addDays(new Date(), 1), "yyyy-MM-dd")}
                    value={format(endDate, "yyyy-MM-dd")}
                    onChange={handleCustomDateChange}
                  />
                </div>
              )}
              
              <div className={cn(
                "flex items-center gap-2 p-3 rounded-lg",
                selectedPlan ? "bg-green-50" : "bg-gray-50"
              )}>
                <CalendarClock className={cn(
                  "h-5 w-5",
                  selectedPlan ? "text-green-600" : "text-gray-400"
                )} />
                <div className="text-sm">
                  <span className="font-medium">Subscription will end on: </span>
                  <span className={selectedPlan ? "text-green-700" : "text-gray-500"}>
                    {format(endDate, "MMMM d, yyyy")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <DialogFooter className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!selectedPlanId || isSubmitting}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Assigning...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Assign Plan
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
