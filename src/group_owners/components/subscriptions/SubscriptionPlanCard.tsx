
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
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
    <Card className="border shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-4 pt-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg">{plan.name}</h3>
            {plan.description && (
              <p className="text-muted-foreground text-sm mt-1">
                {plan.description}
              </p>
            )}
          </div>
          <Badge
            variant="outline"
            className={`font-medium ${
              finalIntervalColors[plan.interval as keyof typeof finalIntervalColors] || ""
            }`}
          >
            {finalIntervalLabels[plan.interval as keyof typeof finalIntervalLabels]}
          </Badge>
        </div>
        
        <div className="mt-2">
          <div className="flex items-baseline">
            <span className="text-2xl font-bold">
              {formatCurrency(plan.price)}
            </span>
            {plan.interval !== "one-time" && plan.interval !== "lifetime" && (
              <span className="text-muted-foreground text-sm ml-1">
                /{plan.interval.replace("-", " ")}
              </span>
            )}
          </div>
          
          {plan.has_trial_period && plan.trial_days && plan.trial_days > 0 && (
            <div className="flex items-center mt-2 text-sm text-indigo-600">
              <GiftIcon className="h-4 w-4 mr-1" />
              <span>{plan.trial_days}-day free trial</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-6 pt-0">
        {plan.features && plan.features.length > 0 ? (
          <ul className="space-y-2">
            {plan.features.map((feature, i) => (
              <li key={i} className="flex items-start">
                <CheckIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm italic">
            No features specified
          </p>
        )}
      </CardContent>
      <CardFooter className="bg-muted/50 pt-4 pb-4 flex justify-end space-x-2 border-t">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(plan)}
          className="h-8 px-2 text-muted-foreground"
        >
          <EditIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(plan.id)}
          className="h-8 px-2 text-destructive hover:text-destructive"
        >
          <Trash2Icon className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};
