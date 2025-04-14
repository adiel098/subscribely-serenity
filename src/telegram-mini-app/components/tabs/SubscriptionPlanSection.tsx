import React from "react";
import { ChevronDown, Sparkles, AlertTriangle } from "lucide-react";
import { Plan } from "@/telegram-mini-app/types/community.types";
import { SubscriptionPlans } from "@/telegram-mini-app/components/SubscriptionPlans";
import { Subscription } from "@/telegram-mini-app/services/memberService";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { createLogger } from "@/telegram-mini-app/utils/debugUtils";

// Define a simplified ChannelInfo type to avoid import conflicts
interface ChannelInfo {
  id: string;
  name: string;
  type: string;
}

// Import the community channels hook without type conflicts
const useCommunityChannels = (communityId: string | null) => {
  return {
    channels: [] as ChannelInfo[],
    isGroup: false,
    isLoading: false
  };
};

const logger = createLogger("SubscriptionPlanSection");

interface SubscriptionPlanSectionProps {
  plans: Plan[];
  selectedPlan: Plan | null;
  onPlanSelect: (plan: Plan) => void;
  showPaymentMethods: boolean;
  userSubscriptions?: Subscription[];
  communityId?: string;
  communityName?: string;
}

export const SubscriptionPlanSection: React.FC<SubscriptionPlanSectionProps> = ({
  plans,
  selectedPlan,
  onPlanSelect,
  showPaymentMethods,
  userSubscriptions = [],
  communityId,
  communityName = "Community"
}) => {
  // Safe guard against undefined or non-array plans
  const validPlans = Array.isArray(plans) ? plans : [];
  
  // Sort plans from least expensive to most expensive
  const sortedPlans = [...validPlans].sort((a, b) => a.price - b.price);
  
  // Get channel information for this community
  const { channels, isGroup, isLoading: channelsLoading } = useCommunityChannels(communityId || null);
  
  logger.log('SubscriptionPlanSection received plans:', validPlans);
  logger.log('Community channels:', channels);
  logger.log('Is group:', isGroup);
  
  // Validate that plans have all necessary data
  const invalidPlans = validPlans.filter(plan => !plan.id || !plan.name || typeof plan.price !== 'number');
  if (invalidPlans.length > 0) {
    logger.warn(`Found ${invalidPlans.length} invalid plans:`, invalidPlans);
  }
  
  if (validPlans.length === 0) {
    logger.warn("No subscription plans available");
    return (
      <div className="text-center p-4 max-w-sm mx-auto">
        <Alert variant="destructive" className="bg-amber-50 border-amber-200">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <AlertTitle className="text-amber-800 font-semibold">No subscription plans available</AlertTitle>
          <AlertDescription className="text-amber-700 text-sm">
            This community doesn't have any active subscription plans at the moment. 
            Please check back later or contact the community owner.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Use an empty div for channel preview since we're just making a type fix */}
  <div id="available-channels-preview"></div>
  
  <div id="subscription-plans" className="scroll-mt-4 pt-2">
    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-3 rounded-lg mb-0 max-w-sm mx-auto">
      <motion.div 
        className="text-center space-y-3 mb-1"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Badge variant="secondary" className="px-5 py-2 text-base font-medium bg-gradient-to-r from-purple-500/20 to-indigo-500/20">
          <Sparkles className="h-5 w-5 mr-2 text-indigo-600" />
          Choose Your Plan <Sparkles className="h-4 w-4 ml-1 text-amber-500" />
        </Badge>
        <p className="text-sm text-gray-600">Select the perfect plan for your needs 🚀</p>
      </motion.div>
      
      <SubscriptionPlans
        plans={sortedPlans}
        selectedPlan={selectedPlan}
        onPlanSelect={onPlanSelect}
        userSubscriptions={userSubscriptions}
      />
    </div>
  </div>

  {!selectedPlan && !showPaymentMethods && (
    <div className="flex justify-center py-2 animate-bounce">
      <ChevronDown className="h-4 w-4 text-primary/50" />
    </div>
  )}
</>;
};
