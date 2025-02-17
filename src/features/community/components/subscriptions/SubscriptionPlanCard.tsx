import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckIcon, EditIcon, TrashIcon, StarIcon } from "lucide-react";

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
      <div className="p-8 flex flex-col flex-grow">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
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
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50/80"
              onClick={() => onEdit(plan)}
            >
              <EditIcon className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-red-400 hover:text-red-500 hover:bg-red-50/80"
              onClick={() => onDelete(plan.id)}
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
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
