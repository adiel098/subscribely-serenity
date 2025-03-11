
import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Star, Zap, Shield, Award, Check } from "lucide-react";
import { Plan } from "@/telegram-mini-app/types/community.types";
import { motion } from "framer-motion";
import { Subscription } from "../services/memberService";
import { isSubscriptionActive } from "./subscriptions/utils";

interface SubscriptionPlansProps {
  plans: Plan[];
  selectedPlan: Plan | null;
  onPlanSelect: (plan: Plan) => void;
  userSubscriptions?: Subscription[];
}

export const SubscriptionPlans = ({
  plans,
  selectedPlan,
  onPlanSelect,
  userSubscriptions = []
}: SubscriptionPlansProps) => {
  // Function to get a random icon for each feature
  const getFeatureIcon = (index: number) => {
    const icons = [
      <CheckCircle2 key="check" className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />,
      <Star key="star" className="h-4 w-4 text-amber-500 mr-2 flex-shrink-0" />,
      <Zap key="zap" className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />,
      <Shield key="shield" className="h-4 w-4 text-purple-500 mr-2 flex-shrink-0" />,
      <Award key="award" className="h-4 w-4 text-pink-500 mr-2 flex-shrink-0" />
    ];
    return icons[index % icons.length];
  };

  // Get interval emoji and label
  const getIntervalDisplay = (interval: string) => {
    switch (interval) {
      case 'monthly':
        return { emoji: '🔄', label: 'Monthly' };
      case 'quarterly':
        return { emoji: '🔷', label: 'Quarterly' };
      case 'half-yearly':
        return { emoji: '½', label: 'Half-Yearly' };
      case 'yearly':
        return { emoji: '📅', label: 'Yearly' };
      case 'lifetime':
        return { emoji: '♾️', label: 'Lifetime' };
      case 'one-time':
        return { emoji: '🎯', label: 'One-Time' };
      default:
        return { emoji: '⏱️', label: interval };
    }
  };

  // Check if the user has already subscribed to this plan and if it's active
  const isSubscribedToPlan = (planId: string) => {
    return userSubscriptions.some(subscription => 
      subscription.plan?.id === planId && 
      isSubscriptionActive(subscription)
    );
  };

  // Animation variants for container
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  // Animation variants for items
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <motion.div 
      className="grid gap-4 max-w-md mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {plans.map((plan, planIndex) => {
        const isActive = isSubscribedToPlan(plan.id);
        const intervalDisplay = getIntervalDisplay(plan.interval);
        const isPremium = planIndex === 0 || plan.name.toLowerCase().includes('premium') || plan.name.toLowerCase().includes('pro');
        
        return (
          <motion.div
            key={plan.id}
            variants={itemVariants}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className={`group relative p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
              selectedPlan?.id === plan.id
                ? 'border-indigo-500 shadow-md bg-indigo-50/50'
                : isPremium 
                  ? 'border-indigo-200 hover:border-indigo-400 hover:shadow-sm' 
                  : 'border-gray-200 hover:border-indigo-300 hover:shadow-sm'
            }`}
            onClick={() => onPlanSelect(plan)}
          >
            {isActive && (
              <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                <Check className="h-3 w-3" />
              </div>
            )}
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex gap-1.5">
                  <Badge variant={isPremium ? "default" : "outline"} className="mb-1 text-xs">
                    {intervalDisplay.emoji} {intervalDisplay.label}
                  </Badge>
                  {isActive && (
                    <Badge variant="success" className="mb-1 text-xs animate-pulse">
                      Active
                    </Badge>
                  )}
                  {isPremium && !isActive && (
                    <Badge variant="secondary" className="mb-1 text-xs bg-gradient-to-r from-indigo-500/20 to-purple-500/20">
                      Recommended
                    </Badge>
                  )}
                </div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">
                  {plan.name}
                </h3>
                <p className="text-xs text-gray-600 font-light">{plan.description}</p>
              </div>
              <div className="text-right">
                <div className="relative">
                  <p className="text-xl font-bold bg-gradient-to-br from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    ${plan.price}
                  </p>
                  <p className="text-xs text-gray-500">
                    {plan.interval === 'lifetime' || plan.interval === 'one-time' 
                      ? 'one-time' 
                      : `per ${plan.interval.replace('ly', '')}`}
                  </p>
                </div>
              </div>
            </div>
            
            {plan.features && plan.features.length > 0 && (
              <motion.ul 
                className="mt-3 space-y-1.5"
                initial="hidden"
                animate="show"
                variants={{
                  hidden: {},
                  show: {
                    transition: {
                      staggerChildren: 0.1,
                      delayChildren: 0.2
                    }
                  }
                }}
              >
                {plan.features.map((feature, index) => (
                  <motion.li 
                    key={index} 
                    className="flex items-center text-gray-700 text-xs"
                    variants={{
                      hidden: { opacity: 0, x: -10 },
                      show: { 
                        opacity: 1, 
                        x: 0,
                        transition: { duration: 0.4 }
                      }
                    }}
                  >
                    {getFeatureIcon(index)}
                    <span>{feature}</span>
                  </motion.li>
                ))}
              </motion.ul>
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
};
