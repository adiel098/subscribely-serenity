
import React from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MoreHorizontal, 
  Check, 
  Edit2, 
  Trash2, 
  ToggleLeft, 
  ToggleRight 
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { SubscriptionPlan } from "@/group_owners/hooks/types/subscription.types";
import { formatCurrency } from "@/utils/format";

interface SubscriptionPlanCardProps {
  plan: SubscriptionPlan;
  onUpdate: (plan: SubscriptionPlan) => void;
  onDelete: (planId: string) => Promise<void>;
  onToggleStatus: (planId: string, is_active: boolean) => Promise<void>;
}

export const SubscriptionPlanCard: React.FC<SubscriptionPlanCardProps> = ({
  plan,
  onUpdate,
  onDelete,
  onToggleStatus
}) => {
  const getIntervalLabel = (interval: string): string => {
    const mapping: Record<string, string> = {
      'monthly': 'Monthly',
      'quarterly': 'Quarterly',
      'half_yearly': 'Half-Yearly',
      'yearly': 'Yearly',
      'one-time': 'One-Time',
      'lifetime': 'Lifetime'
    };
    
    return mapping[interval] || interval;
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete the ${plan.name} plan?`)) {
      await onDelete(plan.id);
    }
  };

  const handleToggleStatus = async () => {
    await onToggleStatus(plan.id, plan.is_active);
  };

  return (
    <Card className={`relative overflow-hidden ${!plan.is_active ? 'opacity-70' : ''}`}>
      {/* Status indicator */}
      <Badge 
        variant={plan.is_active ? "default" : "outline"}
        className="absolute top-3 right-3 z-10"
      >
        {plan.is_active ? 'Active' : 'Inactive'}
      </Badge>
      
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold">
          {plan.name}
        </CardTitle>
        <CardDescription>
          {getIntervalLabel(plan.interval)}
          {plan.interval !== "one-time" && plan.interval !== "lifetime" && " Plan"}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="mb-4">
          <p className="text-3xl font-bold">{formatCurrency(plan.price)}</p>
          
          {/* Trial period badge */}
          {plan.has_trial_period && plan.trial_days > 0 && (
            <Badge variant="secondary" className="mt-1">
              {plan.trial_days} Days Free Trial
            </Badge>
          )}
        </div>
        
        {plan.description && (
          <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
        )}
        
        <div className="space-y-2">
          <p className="font-semibold text-sm">Features:</p>
          {plan.features && plan.features.length > 0 ? (
            <ul className="space-y-1">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No features listed</p>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onUpdate(plan)}>
              <Edit2 className="mr-2 h-4 w-4" />
              Edit Plan
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleToggleStatus}>
              {plan.is_active ? (
                <>
                  <ToggleLeft className="mr-2 h-4 w-4" />
                  Disable Plan
                </>
              ) : (
                <>
                  <ToggleRight className="mr-2 h-4 w-4" />
                  Enable Plan
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleDelete}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Plan
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
};
