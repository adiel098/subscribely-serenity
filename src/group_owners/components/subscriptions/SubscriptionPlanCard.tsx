import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SubscriptionPlan } from "@/group_owners/hooks/types/subscription.types";
import { CheckIcon, ClockIcon, EditIcon, GiftIcon, StarIcon, Trash2Icon } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export interface SubscriptionPlanCardProps {
  plan: SubscriptionPlan;
  onEdit: (plan: SubscriptionPlan) => void;
  onDelete: (planId: string) => void;
  intervalColors?: {
    monthly: string;
    quarterly: string;
    "half-yearly": string;
    yearly: string;
    "one-time": string;
    lifetime: string;
  };
  intervalLabels?: {
    monthly: string;
    quarterly: string;
    "half-yearly": string;
    yearly: string;
    "one-time": string;
    lifetime: string;
  };
}

export const SubscriptionPlanCard = ({
  plan,
  onEdit,
  onDelete,
  intervalColors,
  intervalLabels
}: SubscriptionPlanCardProps) => {
  const defaultIntervalLabel = {
    monthly: "Monthly",
    quarterly: "Quarterly",
    "half-yearly": "Half-Yearly",
    yearly: "Yearly",
    "one-time": "One-Time",
    lifetime: "Lifetime",
  };

  const defaultIntervalColor = {
    monthly: "bg-blue-100 text-blue-800",
    quarterly: "bg-green-100 text-green-800",
    "half-yearly": "bg-purple-100 text-purple-800", 
    yearly: "bg-amber-100 text-amber-800",
    "one-time": "bg-gray-100 text-gray-800",
    lifetime: "bg-indigo-100 text-indigo-800",
  };

  const finalIntervalLabels = intervalLabels || defaultIntervalLabel;
  const finalIntervalColors = intervalColors || defaultIntervalColor;

  return (
    <Card className="border shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
      <CardHeader className="pb-2 sm:pb-4 pt-2 sm:pt-6 px-2 sm:px-6">
        <div className="flex justify-between items-start gap-1">
          <div>
            <h3 className="font-bold text-s sm:text-lg leading-tight">{plan.name}</h3>
            {plan.description && (
              <p className="text-muted-foreground text-[10px] sm:text-sm mt-0.5 sm:mt-1 line-clamp-2">
                {plan.description}
              </p>
            )}
          </div>
          <Badge
            variant="outline"
            className={`font-medium text-[10px] sm:text-sm whitespace-nowrap ${
              finalIntervalColors[plan.interval as keyof typeof finalIntervalColors] || ""
            }`}
          >
            {finalIntervalLabels[plan.interval as keyof typeof finalIntervalLabels]}
          </Badge>
        </div>
        
        <div className="mt-1 sm:mt-2">
          <div className="flex items-baseline flex-wrap">
            <span className="text-base sm:text-2xl font-bold">
              {formatCurrency(plan.price)}
            </span>
            {plan.interval !== "one-time" && plan.interval !== "lifetime" && (
              <span className="text-muted-foreground text-[10px] sm:text-sm ml-0.5 sm:ml-1">
                /{plan.interval.replace("-", " ")}
              </span>
            )}
          </div>
          
          {plan.has_trial_period && plan.trial_days && plan.trial_days > 0 && (
            <div className="flex items-center mt-0.5 sm:mt-2 text-[10px] sm:text-sm text-indigo-600">
              <GiftIcon className="h-2.5 w-2.5 sm:h-4 sm:w-4 mr-0.5 sm:mr-1" />
              <span>{plan.trial_days}-day free trial</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-2 sm:pb-6 pt-0 px-2 sm:px-6 flex-1 flex flex-col">
        {plan.features && plan.features.length > 0 ? (
          <div className="flex flex-col flex-1">
            <ul className="space-y-0.5 sm:space-y-2 flex-1">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start">
                  <CheckIcon className="h-2.5 w-2.5 sm:h-4 sm:w-4 text-green-500 mr-0.5 sm:mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-[10px] sm:text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-end space-x-0.5 sm:space-x-2 pt-1 sm:pt-4 mt-auto">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(plan)}
                className="h-5 sm:h-8 px-0.5 sm:px-2 text-muted-foreground hover:text-indigo-600 hover:bg-indigo-50"
              >
                <EditIcon className="h-2.5 w-2.5 sm:h-4 sm:w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(plan.id)}
                className="h-5 sm:h-8 px-0.5 sm:px-2 text-destructive hover:text-destructive hover:bg-red-50"
              >
                <Trash2Icon className="h-2.5 w-2.5 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-muted-foreground text-[10px] sm:text-sm italic">
              No features specified
            </p>
            <div className="flex justify-end space-x-0.5 sm:space-x-2 mt-1 sm:mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(plan)}
                className="h-5 sm:h-8 px-0.5 sm:px-2 text-muted-foreground hover:text-indigo-600 hover:bg-indigo-50"
              >
                <EditIcon className="h-2.5 w-2.5 sm:h-4 sm:w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(plan.id)}
                className="h-5 sm:h-8 px-0.5 sm:px-2 text-destructive hover:text-destructive hover:bg-red-50"
              >
                <Trash2Icon className="h-2.5 w-2.5 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
