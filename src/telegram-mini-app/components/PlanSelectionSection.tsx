
import React from "react";
import { ChevronDown } from "lucide-react"; 
import { Plan } from "../types/app.types";
import { SubscriptionPlans } from "./SubscriptionPlans";

interface PlanSelectionSectionProps {
  plans: Plan[];
  selectedPlan: Plan | null;
  onPlanSelect: (plan: Plan) => void;
}

export const PlanSelectionSection = ({ 
  plans, 
  selectedPlan, 
  onPlanSelect 
}: PlanSelectionSectionProps) => {
  return (
    <>
      <SubscriptionPlans
        plans={plans}
        selectedPlan={selectedPlan}
        onPlanSelect={onPlanSelect}
      />

      {!selectedPlan && (
        <div className="flex justify-center py-8 animate-bounce">
          <ChevronDown className="h-6 w-6 text-primary/50" />
        </div>
      )}
    </>
  );
};
