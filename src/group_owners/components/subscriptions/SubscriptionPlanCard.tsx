
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckIcon, PencilIcon, TrashIcon, StarIcon, Sparkles } from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PlanCardHeader } from "./PlanCardHeader";
import { PlanFeatureList } from "./PlanFeatureList";
import { motion } from "framer-motion";

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
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="group relative overflow-hidden border-2 hover:border-indigo-300 transition-all duration-300 animate-fade-in bg-gradient-to-br from-white to-indigo-50/30 h-full flex flex-col shadow-sm hover:shadow-md">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-400 to-indigo-600"></div>
        
        {/* Decorative background elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 bg-indigo-100/30 rounded-full blur-3xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-indigo-100/30 rounded-full blur-xl pointer-events-none"></div>
        
        {/* Action Buttons - Enhanced styling */}
        <div className="absolute top-3 right-3 flex gap-2 z-10">
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
        
        <div className="p-8 flex flex-col flex-grow relative z-10">
          <div className="mb-2">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${intervalColors[plan.interval]}`}>
              {intervalLabels[plan.interval]}
            </span>
          </div>
          
          <PlanCardHeader 
            name={plan.name}
            price={plan.price}
            interval={plan.interval}
            intervalLabel={intervalLabels[plan.interval]}
          />
          
          {plan.description && (
            <p className="text-gray-600 leading-relaxed mt-4 text-sm">{plan.description}</p>
          )}
          
          {plan.features && plan.features.length > 0 && (
            <PlanFeatureList features={plan.features} />
          )}
        </div>
      </Card>
    </motion.div>
  );
};
