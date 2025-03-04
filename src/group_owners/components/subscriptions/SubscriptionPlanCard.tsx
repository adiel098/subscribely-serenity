
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckIcon, PencilIcon, TrashIcon, StarIcon } from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  interval: 'monthly' | 'quarterly' | 'half-yearly' | 'yearly' | 'one-time';
  features: string[];
}

interface Props {
  plan: SubscriptionPlan;
  intervalColors: Record<string, string>;
  intervalLabels: Record<string, string>;
  onEdit: (plan: SubscriptionPlan) => void;
  onDelete: (id: string) => void;
}

export const SubscriptionPlanCard = ({ 
  plan, 
  intervalColors, 
  intervalLabels, 
  onEdit, 
  onDelete 
}: Props) => {
  return (
    <Card className={`group relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 animate-fade-in bg-gradient-to-br h-full flex flex-col ${intervalColors[plan.interval]}`}>
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary/50 to-primary"></div>
      
      {/* Action Buttons - Now visible all the time with enhanced styling */}
      <div className="absolute top-2 right-2 flex gap-2 z-10">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="h-8 w-8 rounded-full bg-green-50 border border-green-100 text-green-600 hover:bg-green-100 hover:text-green-700 shadow-sm"
                onClick={() => onEdit(plan)}
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
                variant="ghost" 
                size="sm"
                className="h-8 w-8 rounded-full bg-red-50 border border-red-100 text-red-500 hover:bg-red-100 hover:text-red-600 shadow-sm"
                onClick={() => onDelete(plan.id)}
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
      
      <div className="p-8 flex flex-col flex-grow">
        <div className="space-y-1 mt-4">
          <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            {plan.name}
            <StarIcon className="h-5 w-5 text-yellow-500" />
          </h3>
          <div className="flex items-baseline gap-1.5">
            <span className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              ${plan.price}
            </span>
            <span className="text-gray-600 text-lg">
              {plan.interval === "one-time" ? "" : `/ ${intervalLabels[plan.interval]}`}
            </span>
          </div>
        </div>
        
        {plan.description && <p className="text-gray-600 leading-relaxed mt-4">{plan.description}</p>}
        
        {plan.features && plan.features.length > 0 && (
          <ul className="space-y-4 mt-6 flex-grow">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3 animate-fade-in" style={{
                animationDelay: `${index * 100}ms`
              }}>
                <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckIcon className="h-3.5 w-3.5 text-green-600" />
                </div>
                <span className="text-gray-700 leading-tight">{feature}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
};
