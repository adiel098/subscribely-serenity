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
  ToggleRight,
  Star,
  Calendar,
  Repeat,
  ShieldCheck,
  Award
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
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  
  const getIntervalIcon = (interval: string) => {
    switch (interval) {
      case 'monthly':
        return <Calendar className="h-4 w-4" />;
      case 'yearly':
        return <Repeat className="h-4 w-4" />;
      case 'lifetime':
        return <ShieldCheck className="h-4 w-4" />;
      case 'one-time':
        return <Award className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  // Generate a subtle background gradient based on interval
  const getBgGradient = (interval: string) => {
    switch (interval) {
      case 'monthly':
        return 'from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30';
      case 'quarterly':
        return 'from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30';
      case 'half_yearly':
        return 'from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30';
      case 'yearly':
        return 'from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30';
      case 'one-time':
        return 'from-red-50 to-pink-50 dark:from-red-950/30 dark:to-pink-950/30';
      case 'lifetime':
        return 'from-slate-50 to-zinc-50 dark:from-slate-950/30 dark:to-zinc-950/30';
      default:
        return 'from-gray-50 to-slate-50 dark:from-gray-950/30 dark:to-slate-950/30';
    }
  };

  // Get border color based on active status
  const getBorderColor = () => {
    if (!plan.is_active) return 'border-muted';
    
    switch (plan.interval) {
      case 'monthly':
        return 'border-blue-200 dark:border-blue-800';
      case 'yearly':
        return 'border-amber-200 dark:border-amber-800';
      case 'lifetime':
        return 'border-slate-200 dark:border-slate-800';
      default:
        return 'border-purple-200 dark:border-purple-800';
    }
  };

  return (
    <motion.div
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="h-full"
    >
      <Card 
        className={`relative overflow-hidden h-full border shadow-sm hover:shadow-md transition-all ${getBgGradient(plan.interval)} ${getBorderColor()}`}
      >
        {/* Status indicator dot in top right corner */}
        <div 
          className={`absolute top-3 right-3 h-3 w-3 rounded-full z-10 ${
            plan.is_active 
              ? 'bg-green-500 animate-pulse' 
              : 'bg-gray-400'
          }`}
        />
        
        {/* Popular marker */}
        {plan.is_popular && (
          <div className="absolute -right-12 top-6 bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-12 py-1 transform rotate-45 shadow-md z-10">
            <div className="flex items-center justify-center gap-1">
              <Star className="h-3 w-3" />
              <span className="text-xs font-semibold">Popular</span>
            </div>
          </div>
        )}

        <CardHeader className="pb-4 relative">
          <div className="flex justify-between items-start">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <CardTitle className={`text-xl font-bold ${!plan.is_active && 'text-muted-foreground'}`}>
                  {plan.name}
                </CardTitle>
                
                {/* Trial period badge */}
                {plan.has_trial_period && plan.trial_days > 0 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                          {plan.trial_days}d Trial
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>Includes a {plan.trial_days}-day free trial period</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              
              <CardDescription className="flex items-center gap-1.5">
                {getIntervalIcon(plan.interval)}
                <span>
                  {getIntervalLabel(plan.interval)}
                  {plan.interval !== "one-time" && plan.interval !== "lifetime" && " Plan"}
                </span>
              </CardDescription>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => onUpdate(plan)} className="gap-2 cursor-pointer">
                  <Edit2 className="h-4 w-4" />
                  Edit Plan
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={() => onToggleStatus(plan.id, !plan.is_active)}
                  className="gap-2 cursor-pointer"
                >
                  {plan.is_active ? (
                    <>
                      <ToggleLeft className="h-4 w-4 text-red-500" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <ToggleRight className="h-4 w-4 text-green-500" />
                      Activate
                    </>
                  )}
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  onClick={() => onDelete(plan.id)}
                  className="gap-2 text-red-600 cursor-pointer hover:text-red-700 focus:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        
        <CardContent className="pt-1 pb-4">
          <div className="mb-4">
            <div className="flex items-end gap-1">
              <p className={`text-3xl font-bold ${!plan.is_active && 'text-muted-foreground'}`}>
                {formatCurrency(plan.price)}
              </p>
              <span className="text-muted-foreground text-sm mb-1">
                {plan.interval !== "one-time" && plan.interval !== "lifetime" && `/${plan.interval.slice(0, 2)}`}
              </span>
            </div>
          </div>
          
          {plan.description && (
            <p className={`text-sm mb-4 ${!plan.is_active && 'text-muted-foreground'}`}>
              {plan.description}
            </p>
          )}
          
          <div className="space-y-2">
            <p className={`font-semibold text-sm ${!plan.is_active && 'text-muted-foreground'}`}>Features:</p>
            {plan.features && plan.features.length > 0 ? (
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <motion.li 
                    key={index} 
                    className={`flex items-start gap-2 text-sm ${!plan.is_active && 'text-muted-foreground'}`}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                    </div>
                    <span>{feature}</span>
                  </motion.li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No features listed</p>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="pt-2 pb-4 flex flex-col gap-3 items-stretch">
          <Button 
            variant="outline"
            onClick={() => onUpdate(plan)}
            className={`w-full border-dashed ${!plan.is_active ? 'opacity-70' : 'hover:bg-muted'}`}
          >
            <Edit2 className="mr-2 h-4 w-4" />
            Edit Plan Details
          </Button>
          
          <div className="flex items-center justify-between w-full text-sm">
            <div className="flex items-center gap-2">
              <Badge variant={plan.is_active ? "success" : "secondary"} className="capitalize">
                {plan.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
            
            <p className="text-muted-foreground text-xs">
              ID: {plan.id?.substring(0, 6)}...
            </p>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};
