
import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Sparkles } from "lucide-react";
import { Plan } from "@/telegram-mini-app/pages/TelegramMiniApp";

interface SubscriptionPlansProps {
  plans: Plan[];
  selectedPlan: Plan | null;
  onPlanSelect: (plan: Plan) => void;
}


export const SubscriptionPlans = ({
  plans,
  selectedPlan,
  onPlanSelect
}: SubscriptionPlansProps) => {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <Badge variant="secondary" className="px-4 py-1.5">
          <Sparkles className="h-4 w-4 mr-2" />
          Premium Features
        </Badge>
        <h2 className="text-3xl font-bold text-gray-900">Choose Your Plan</h2>
        <p className="text-gray-600">Select the perfect plan for you</p>
      </div>

      <div className="grid gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`group p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer hover-scale ${
              selectedPlan?.id === plan.id
                ? 'border-primary shadow-xl bg-primary/5'
                : 'border-gray-200 hover:border-primary/50 hover:shadow-lg'
            }`}
            onClick={() => onPlanSelect(plan)}
          >
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <Badge variant="outline" className="mb-2">
                  {plan.interval}
                </Badge>
                <h3 className="text-2xl font-bold text-gray-900 group-hover:text-primary transition-colors">
                  {plan.name}
                </h3>
                <p className="text-gray-600">{plan.description}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold bg-gradient-to-br from-primary to-primary/70 bg-clip-text text-transparent">
                  ${plan.price}
                </p>
                <p className="text-sm text-gray-500">{plan.interval}</p>
              </div>
            </div>
            {plan.features && plan.features.length > 0 && (
              <ul className="mt-6 space-y-3">
                {plan.features.map((feature, index) => (
                  <li 
                    key={index} 
                    className="flex items-center text-gray-700 animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
