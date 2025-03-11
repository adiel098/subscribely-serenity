
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Star } from "lucide-react";

export interface PlatformPlan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  interval: string;
  is_active: boolean;
}

interface PlatformPlanCardProps {
  plan: PlatformPlan;
  selectedPlanId: string | null;
  onSelectPlan: (plan: PlatformPlan) => void;
  formatInterval: (interval: string) => string;
}

export const PlatformPlanCard = ({ 
  plan, 
  selectedPlanId, 
  onSelectPlan, 
  formatInterval 
}: PlatformPlanCardProps) => {
  const isPro = plan.name.toLowerCase().includes('pro');
  const isSelected = selectedPlanId === plan.id;
  
  // Helper function to get emoji based on interval
  const getIntervalEmoji = (interval: string) => {
    switch (interval) {
      case 'monthly': return '📅';
      case 'quarterly': return '🗓️';
      case 'yearly': return '📆';
      case 'lifetime': return '♾️';
      default: return '⏱️';
    }
  };
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="w-full max-w-sm"
    >
      <Card 
        key={plan.id}
        className={`cursor-pointer h-full ${
          isSelected 
            ? 'border-indigo-400 shadow-md ring-2 ring-indigo-200'
            : isPro 
              ? 'border-indigo-200 shadow-sm' 
              : 'border-muted'
        }`}
        onClick={() => onSelectPlan(plan)}
      >
        <CardHeader>
          {isPro && (
            <Badge className="self-start mb-2 bg-indigo-100 text-indigo-800 hover:bg-indigo-200 border-none">
              <Star className="h-3 w-3 mr-1 text-amber-500" /> Most Popular
            </Badge>
          )}
          <CardTitle>{plan.name}</CardTitle>
          <CardDescription>{plan.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline mb-4">
            <span className="text-2xl font-bold">${plan.price}</span>
            <span className="text-sm text-muted-foreground ml-1">
              /{formatInterval(plan.interval)}
            </span>
          </div>
          
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-indigo-500" />
            <span className="text-sm capitalize">
              {getIntervalEmoji(plan.interval)} {plan.interval} billing
            </span>
          </div>
        </CardContent>
        <CardFooter>
          {isSelected ? (
            <Badge className="w-full py-2 justify-center bg-indigo-100 text-indigo-800 hover:bg-indigo-200 border-none">
              Selected
            </Badge>
          ) : (
            <Badge className="w-full py-2 justify-center bg-gray-100 text-gray-800 hover:bg-gray-200 border-none">
              Click to Select
            </Badge>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
};
