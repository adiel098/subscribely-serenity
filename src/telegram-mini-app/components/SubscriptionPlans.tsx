
import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Sparkles, Star, Zap, Shield, Award } from "lucide-react";
import { Plan } from "@/telegram-mini-app/types/community.types";
import { motion } from "framer-motion";

interface SubscriptionPlansProps {
  plans: Plan[];
  selectedPlan: Plan | null;
  onPlanSelect: (plan: Plan) => void;
}

export const SubscriptionPlans = ({
  plans,
  selectedPlan,
  onPlanSelect
}: SubscriptionPlansProps) => {
  // Function to get a random icon for each feature
  const getFeatureIcon = (index: number) => {
    const icons = [
      <CheckCircle2 key="check" className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />,
      <Star key="star" className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0" />,
      <Zap key="zap" className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0" />,
      <Shield key="shield" className="h-5 w-5 text-purple-500 mr-3 flex-shrink-0" />,
      <Award key="award" className="h-5 w-5 text-pink-500 mr-3 flex-shrink-0" />
    ];
    return icons[index % icons.length];
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
    <div className="space-y-8">
      <motion.div 
        className="text-center space-y-3"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Badge variant="secondary" className="px-4 py-1.5 bg-gradient-to-r from-purple-500/20 to-blue-500/20">
          <Sparkles className="h-4 w-4 mr-2 text-purple-500" />
          Premium ✨
        </Badge>
        <h2 className="text-3xl font-bold bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent">
          Choose Your Plan
        </h2>
        <p className="text-gray-600">Select the perfect plan for your needs 🚀</p>
      </motion.div>

      <motion.div 
        className="grid gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {plans.map((plan, planIndex) => (
          <motion.div
            key={plan.id}
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`group p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer glassmorphism ${
              selectedPlan?.id === plan.id
                ? 'border-primary shadow-xl bg-primary/5'
                : 'border-gray-200 hover:border-primary/50 hover:shadow-lg'
            }`}
            onClick={() => onPlanSelect(plan)}
          >
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <Badge variant={planIndex === 0 ? "default" : "outline"} className="mb-2">
                  {plan.interval === 'monthly' ? '🔄 Monthly' : 
                    plan.interval === 'yearly' ? '📅 Yearly' : 
                    plan.interval === 'lifetime' ? '♾️ Lifetime' : 
                    plan.interval}
                </Badge>
                <h3 className="text-2xl font-bold text-gray-900 group-hover:text-primary transition-colors">
                  {plan.name}
                </h3>
                <p className="text-gray-600 font-light mt-1">{plan.description}</p>
              </div>
              <div className="text-right">
                <div className="relative">
                  {planIndex === 0 && (
                    <span className="absolute -top-6 right-0 text-xs font-medium text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
                      ⭐ Recommended
                    </span>
                  )}
                  <p className="text-3xl font-bold bg-gradient-to-br from-primary to-primary/70 bg-clip-text text-transparent">
                    ${plan.price}
                  </p>
                  <p className="text-sm text-gray-500">
                    {plan.interval === 'monthly' ? 'per month' : 
                      plan.interval === 'yearly' ? 'per year' : 
                      plan.interval === 'lifetime' ? 'one-time' : 
                      plan.interval}
                  </p>
                </div>
              </div>
            </div>
            
            {plan.features && plan.features.length > 0 && (
              <motion.ul 
                className="mt-6 space-y-3"
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
                    className="flex items-center text-gray-700"
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
        ))}
      </motion.div>
    </div>
  );
};
