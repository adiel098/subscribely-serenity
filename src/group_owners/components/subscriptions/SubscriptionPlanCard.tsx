
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PencilIcon, TrashIcon } from "lucide-react";
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
      <Card className="group relative overflow-hidden border hover:border-indigo-300 transition-all duration-300 animate-fade-in bg-white shadow-sm hover:shadow-md h-full">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-400 to-indigo-600"></div>
        
        {/* Action Buttons */}
        <div className="absolute top-2 right-2 flex gap-1.5 z-10">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-7 w-7 p-0 rounded-full bg-green-50 border border-green-100 text-green-600 hover:bg-green-100 hover:text-green-700"
                  onClick={() => onEdit(plan)}
                  type="button"
                >
                  <PencilIcon className="h-3.5 w-3.5" />
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
                  className="h-7 w-7 p-0 rounded-full bg-red-50 border border-red-100 text-red-500 hover:bg-red-100 hover:text-red-600"
                  onClick={() => onDelete(plan.id)}
                  type="button"
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                  <span className="sr-only">Delete plan</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete plan</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <div className="p-4 flex flex-col h-full relative z-0">
          <div className="mb-1.5">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${intervalColors[plan.interval]}`}>
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
            <p className="text-gray-600 leading-relaxed mt-2 text-xs">{plan.description}</p>
          )}
          
          {plan.features && plan.features.length > 0 && (
            <div className="mt-auto pt-3">
              <PlanFeatureList features={plan.features} />
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};
