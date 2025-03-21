
import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Star, Zap, Shield, Award, Calendar, Clock } from "lucide-react";
import { SubscriptionPlan } from "@/group_owners/hooks/types/subscription.types";
import { motion } from "framer-motion";
import { Subscription } from "@/telegram-mini-app/services/memberService";
import { isSubscriptionActive } from "./subscriptions/utils";

interface SubscriptionPlansProps {
  plans: SubscriptionPlan[];
  selectedPlan: SubscriptionPlan | null;
  onPlanSelect: (plan: SubscriptionPlan) => void;
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
        return { emoji: '🔄', icon: <Clock className="h-4 w-4 mr-1 text-blue-500" />, label: 'Monthly' };
      case 'quarterly':
        return { emoji: '🗓️', icon: <Calendar className="h-4 w-4 mr-1 text-indigo-500" />, label: 'Quarterly' };
      case 'half-yearly':
        return { emoji: '📅', icon: <Calendar className="h-4 w-4 mr-1 text-purple-500" />, label: 'Half-Yearly' };
      case 'yearly':
        return { emoji: '🗓️', icon: <Calendar className="h-4 w-4 mr-1 text-green-600" />, label: 'Yearly' };
      case 'lifetime':
        return { emoji: '♾️', icon: <Shield className="h-4 w-4 mr-1 text-indigo-600" />, label: 'Lifetime' };
      case 'one-time':
        return { emoji: '🎯', icon: <Zap className="h-4 w-4 mr-1 text-amber-500" />, label: 'One-Time' };
      default:
        return { emoji: '⏱️', icon: <Clock className="h-4 w-4 mr-1 text-gray-500" />, label: interval };
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
      className="grid gap-2 max-w-sm mx-auto choose-plan-container"
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
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`group relative py-2 px-2.5 rounded-lg transition-all duration-300 cursor-pointer translucent-card ${
              selectedPlan?.id === plan.id
                ? 'border-indigo-500/50 shadow-md'
                : isPremium 
                  ? 'border-indigo-200/70 hover:border-indigo-400/70 hover:shadow-sm' 
                  : 'border-white/40 hover:border-indigo-300/70 hover:shadow-sm'
            }`}
            style={{ height: "auto" }}
            onClick={() => onPlanSelect(plan)}
          >
            {isActive && (
              <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                <CheckCircle2 className="h-3 w-3" />
              </div>
            )}
            <div className="flex justify-between items-start mb-1">
              <div>
                <div className="flex flex-wrap gap-1 mb-1">
                  <Badge variant={isPremium ? "default" : "outline"} className="flex items-center gap-0.5 text-xs py-0 px-1.5">
                    {intervalDisplay.icon} 
                    <span>{intervalDisplay.emoji} {intervalDisplay.label}</span>
                  </Badge>
                  {isActive && (
                    <Badge variant="success" className="text-xs py-0 px-1.5 animate-pulse">
                      Active
                    </Badge>
                  )}
                  {isPremium && !isActive && (
                    <Badge variant="secondary" className="text-xs py-0 px-1.5 bg-gradient-to-r from-indigo-500/20 to-purple-500/20">
                      Recommended
                    </Badge>
                  )}
                </div>
                <h3 className="text-sm font-bold text-gray-900 group-hover:text-indigo-700 transition-colors line-clamp-1">
                  {plan.name}
                </h3>
                {plan.description && (
                  <p className="text-xs text-gray-600 font-light line-clamp-1">{plan.description}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-lg font-bold bg-gradient-to-br from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  ${plan.price}
                </p>
                <p className="text-xs text-gray-500">
                  {plan.interval === 'lifetime' || plan.interval === 'one-time' 
                    ? 'one-time' 
                    : `per ${plan.interval.replace('ly', '')}`}
                </p>
              </div>
            </div>
            
            {plan.features && plan.features.length > 0 && (
              <div className="mt-1 bg-white/50 backdrop-blur-sm p-1.5 rounded-lg border border-white/50">
                <h4 className="text-xs font-medium text-indigo-700 mb-1 flex items-center">
                  <Star className="h-3 w-3 text-amber-500 mr-1" />
                  Features:
                </h4>
                <ul className="space-y-1">
                  {plan.features.map((feature, index) => (
                    <li 
                      key={index} 
                      className="flex items-center text-gray-700 text-xs p-1 rounded-md border border-indigo-100/30 shadow-sm bg-white/70"
                    >
                      {getFeatureIcon(index)}
                      <span className="line-clamp-1">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
};
