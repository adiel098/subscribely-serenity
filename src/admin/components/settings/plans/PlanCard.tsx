
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PencilIcon, TrashIcon, CheckIcon } from "lucide-react";
import { PlatformPlan } from "@/admin/hooks/types/platformPlans.types";
import { Badge } from "@/components/ui/badge";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Props {
  plan: PlatformPlan;
  onEdit: () => void;
  onDelete: () => void;
}

export const PlanCard = ({ plan, onEdit, onDelete }: Props) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(price);
  };

  const getIntervalLabel = (interval: string) => {
    switch (interval) {
      case 'monthly': return 'month';
      case 'quarterly': return 'quarter';
      case 'yearly': return 'year';
      case 'lifetime': return 'one-time';
      default: return interval;
    }
  };

  return (
    <Card className="overflow-hidden border-2 transition-all duration-200 hover:border-indigo-200 hover:shadow-md group bg-gradient-to-br from-white to-indigo-50">
      <div className="p-6 relative flex flex-col h-full">
        <div>
          <div className="flex items-center gap-2 mb-2 pt-4">
            <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
            {!plan.is_active && (
              <Badge variant="outline" className="text-xs border-amber-200 text-amber-600 bg-amber-50">
                Inactive
              </Badge>
            )}
          </div>

          <div className="mb-4">
            <span className="text-3xl font-bold">
              {formatPrice(plan.price)}
            </span>
            {plan.interval !== 'lifetime' && (
              <span className="text-gray-500 text-sm ml-1">
                / {getIntervalLabel(plan.interval)}
              </span>
            )}
          </div>

          {plan.description && (
            <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
          )}

          <div className="border-t border-gray-100 pt-4 mt-2">
            <div className="text-sm font-medium text-gray-700 mb-2">Features:</div>
            <ul className="space-y-2">
              {plan.features?.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <CheckIcon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">{feature}</span>
                </li>
              ))}
              <li className="flex items-start gap-2 text-sm">
                <CheckIcon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-600">
                  {plan.max_communities === 1 
                    ? "1 community" 
                    : `${plan.max_communities} communities`}
                </span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <CheckIcon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-600">
                  {!plan.max_members_per_community 
                    ? "Unlimited members per community" 
                    : `Up to ${plan.max_members_per_community} members per community`}
                </span>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Action buttons moved to the bottom-right corner */}
        <div className="mt-auto pt-4 flex justify-end gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-8 w-8 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 border-indigo-200"
                  onClick={onEdit}
                >
                  <PencilIcon className="h-4 w-4" />
                  <span className="sr-only">Edit plan</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edit plan</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-8 w-8 rounded-full bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 border-red-200"
                  onClick={onDelete}
                >
                  <TrashIcon className="h-4 w-4" />
                  <span className="sr-only">Delete plan</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete plan</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </Card>
  );
};
