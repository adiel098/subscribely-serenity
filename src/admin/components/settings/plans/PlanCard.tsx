
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PencilIcon, TrashIcon, CheckIcon } from "lucide-react";
import { PlatformPlan } from "@/admin/hooks/types/platformPlans.types";
import { Badge } from "@/components/ui/badge";

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

  const getBgColor = () => {
    if (!plan.is_active) return "bg-gray-50";
    
    switch(plan.name.toLowerCase()) {
      case 'basic': return "bg-gradient-to-br from-white to-blue-50";
      case 'professional': return "bg-gradient-to-br from-white to-indigo-50";
      case 'enterprise': return "bg-gradient-to-br from-white to-purple-50";
      default: return "bg-gradient-to-br from-white to-gray-50";
    }
  };

  return (
    <Card className={`overflow-hidden border-2 transition-all duration-200 hover:border-indigo-200 hover:shadow-md group ${getBgColor()}`}>
      <div className="p-6 relative">
        <div className="absolute top-0 right-0 m-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50"
              onClick={onEdit}
            >
              <PencilIcon className="h-3.5 w-3.5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 text-red-400 hover:text-red-500 hover:bg-red-50"
              onClick={onDelete}
            >
              <TrashIcon className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-2">
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
    </Card>
  );
};
