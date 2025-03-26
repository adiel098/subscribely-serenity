import { Plan } from "../AssignPlanDialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";

interface PlanSelectorProps {
  plans: Plan[];
  selectedPlanId: string;
  onPlanChange: (planId: string) => void;
}

export const PlanSelector = ({ plans, selectedPlanId, onPlanChange }: PlanSelectorProps) => {
  const isMobile = useIsMobile();
  const selectedPlan = plans.find(plan => plan.id === selectedPlanId);
  
  return (
    <div className={isMobile ? 'space-y-2' : 'space-y-3'}>
      <Label className={isMobile ? 'text-xs' : ''}>Select Plan</Label>
      <Select value={selectedPlanId} onValueChange={onPlanChange}>
        <SelectTrigger className={isMobile ? 'h-8 text-xs' : ''}>
          <SelectValue placeholder="Select a plan">
            {selectedPlan ? `${selectedPlan.name} - $${selectedPlan.price}/${selectedPlan.interval}` : 'Select a plan'}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {plans.map((plan) => (
            <SelectItem 
              key={plan.id} 
              value={plan.id}
              className={isMobile ? 'text-xs h-8' : ''}
            >
              {plan.name} - ${plan.price}/{plan.interval}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
