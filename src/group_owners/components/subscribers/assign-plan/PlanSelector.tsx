
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plan } from "../AssignPlanDialog";

interface PlanSelectorProps {
  plans: Plan[];
  selectedPlanId: string;
  onPlanChange: (planId: string) => void;
}

export const PlanSelector = ({ 
  plans, 
  selectedPlanId, 
  onPlanChange 
}: PlanSelectorProps) => {
  return (
    <div className="space-y-3">
      <Label htmlFor="plan-select">Select Subscription Plan</Label>
      <Select value={selectedPlanId} onValueChange={onPlanChange}>
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
  );
};
