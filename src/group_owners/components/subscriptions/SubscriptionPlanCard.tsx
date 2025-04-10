import React, { useState } from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { SubscriptionPlan } from "@/group_owners/hooks/types/subscription.types";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";

interface Props {
  plan: SubscriptionPlan;
  onUpdate: (plan: SubscriptionPlan) => void;
  onDelete: (planId: string) => void;
  onToggleStatus: (planId: string, isActive: boolean) => void;
}

export const SubscriptionPlanCard = ({ plan, onUpdate, onDelete, onToggleStatus }: Props) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const formatInterval = (interval: string): string => {
    const mapping: Record<string, string> = {
      'monthly': 'month',
      'quarterly': '3 months',
      'half_yearly': '6 months',
      'half-yearly': '6 months',
      'yearly': 'year',
      'lifetime': 'lifetime',
      'one_time': 'one-time payment',
      'one-time': 'one-time payment',
    };
    
    return mapping[interval] || interval;
  };

  const renderBadge = () => {
    if (plan.is_active) {
      return <Badge className="bg-green-500 text-white">Active</Badge>;
    } else {
      return <Badge variant="outline">Inactive</Badge>;
    }
  };

  const renderFeatures = () => {
    return (
      <ScrollArea className="h-[120px] w-full rounded-md border p-2">
        <ul className="list-disc pl-4 text-sm text-muted-foreground">
          {plan.features.map((feature, index) => (
            <li key={index}>{feature}</li>
          ))}
        </ul>
      </ScrollArea>
    );
  };

  const renderActions = () => {
    return (
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onUpdate(plan)}
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleStatus(plan.id, !plan.is_active)}
          >
            {plan.is_active ? (
              <ToggleLeft className="h-4 w-4" />
            ) : (
              <ToggleRight className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    );
  };

  const renderPriceSection = () => {
    return (
      <div className="text-center mb-6">
        <div className="text-3xl font-bold text-indigo-700">
          ${plan.price}
        </div>
        <div className="text-sm text-muted-foreground">
          {plan.interval === "lifetime" || plan.interval === "one_time" ? 
            "One-time payment" : 
            `per ${formatInterval(plan.interval)}`
          }
        </div>
      </div>
    );
  };

  return (
    <Card className="bg-white shadow-md rounded-lg overflow-hidden">
      <CardHeader className="text-center">
        {renderBadge()}
      </CardHeader>
      <CardContent>
        {renderPriceSection()}
        <h3 className="text-xl font-semibold text-center mb-2">{plan.name}</h3>
        <p className="text-sm text-muted-foreground text-center mb-4">
          {plan.description}
        </p>
        <div className="mb-4">
          <h4 className="uppercase text-xs text-gray-500 font-medium mb-2">
            Features
          </h4>
          {renderFeatures()}
        </div>
      </CardContent>
      <CardFooter>{renderActions()}</CardFooter>
      <ConfirmDeleteDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={() => onDelete(plan.id)}
        itemName={plan.name}
      />
    </Card>
  );
};
