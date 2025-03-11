
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
      className="h-full"
    >
      <Card className="group relative overflow-hidden border hover:border-indigo-300 transition-all duration-300 bg-white shadow-sm hover:shadow-md h-full flex flex-col">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 to-indigo-700"></div>
        
        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex gap-1.5 z-10">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="h-8 w-8 p-0 rounded-full bg-green-50 border border-green-200 text-green-600 hover:bg-green-100 hover:text-green-700 shadow-sm"
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
                  variant="outline" 
                  size="icon"
                  className="h-8 w-8 p-0 rounded-full bg-red-50 border border-red-200 text-red-500 hover:bg-red-100 hover:text-red-600 shadow-sm"
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
        
        <div className="p-5 flex flex-col h-full relative z-0">
          <div className="mb-2">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${intervalColors[plan.interval]}`}>
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
            <p className="text-gray-600 leading-relaxed mt-3 text-sm">{plan.description}</p>
          )}
          
          {plan.features && plan.features.length > 0 && (
            <div className="mt-3">
              <PlanFeatureList features={plan.features} />
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};
