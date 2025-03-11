
import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, Users, Clock, CheckCircle2, Star } from "lucide-react";
import { PlatformPlan } from "@/admin/hooks/types/platformPlans.types";

interface PlatformPlansListProps {
  plans: PlatformPlan[];
  selectedPlan: PlatformPlan | null;
  currentSubscription: any | null;
  formatInterval: (interval: string) => string;
  handleSelectPlan: (plan: PlatformPlan) => void;
}

export const PlatformPlansList = ({ 
  plans, 
  selectedPlan, 
  currentSubscription, 
  formatInterval, 
  handleSelectPlan 
}: PlatformPlansListProps) => {
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
    <div className="flex justify-center">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl">
        {plans.filter(plan => plan.is_active).map((plan) => (
          <motion.div 
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{ y: -5 }}
            className="w-full max-w-sm mx-auto"
          >
            <Card 
              className={`h-full flex flex-col cursor-pointer transition-all duration-300 ${
                selectedPlan?.id === plan.id 
                  ? 'border-indigo-400 shadow-md ring-2 ring-indigo-200'
                  : plan.name.toLowerCase().includes('pro') 
                    ? 'border-indigo-200 shadow-sm hover:shadow-md' 
                    : 'border-muted hover:border-indigo-200 hover:shadow-sm'
              }`}
              onClick={() => handleSelectPlan(plan)}
            >
              <CardHeader>
                {plan.name.toLowerCase().includes('pro') && (
                  <Badge className="self-start mb-2 bg-indigo-100 text-indigo-800 hover:bg-indigo-200 border-none">
                    <Star className="h-3 w-3 mr-1 text-amber-500" /> Most Popular
                  </Badge>
                )}
                <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="flex items-baseline mb-4">
                  <span className="text-3xl font-bold">${plan.price}</span>
                  <span className="text-sm text-muted-foreground ml-1">
                    /{formatInterval(plan.interval)}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-indigo-500" />
                    <span className="text-sm">Up to {plan.max_communities} communities</span>
                  </div>
                  
                  {plan.max_members_per_community && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-indigo-500" />
                      <span className="text-sm">Up to {plan.max_members_per_community} members per community</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-indigo-500" />
                    <span className="text-sm capitalize">
                      {getIntervalEmoji(plan.interval)} {plan.interval} billing
                    </span>
                  </div>
                  
                  {plan.features && plan.features.length > 0 && (
                    <div className="pt-4">
                      <h4 className="font-medium text-sm mb-3">Features included:</h4>
                      <ul className="space-y-2">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 p-2 rounded-md bg-indigo-50/70 hover:bg-indigo-100/70 transition-colors">
                            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                {selectedPlan?.id === plan.id ? (
                  <Badge className="w-full py-2 justify-center bg-indigo-100 text-indigo-800 hover:bg-indigo-200 border-none">
                    Selected
                  </Badge>
                ) : currentSubscription && currentSubscription.platform_plans?.id === plan.id ? (
                  <Badge className="w-full py-2 justify-center bg-green-100 text-green-800 hover:bg-green-200 border-none">
                    Current Plan
                  </Badge>
                ) : (
                  <Badge className="w-full py-2 justify-center bg-gray-100 text-gray-800 hover:bg-gray-200 border-none">
                    Click to Select
                  </Badge>
                )}
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
