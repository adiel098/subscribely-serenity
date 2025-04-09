import React, { useState, useEffect } from "react";
import { useCommunityData } from "@/telegram-mini-app/hooks/useCommunityData";
import { CommunityHeader } from "./CommunityHeader";
import { SubscriptionPlansList } from "./SubscriptionPlansList";
import { Loader2 } from "lucide-react";
import { createLogger } from "../utils/debugUtils";
import { convertToGlobalPlans } from "../utils/subscription-converters";

interface AppContentProps {
  communityId?: string;
  projectId?: string;
  telegramUserId?: string | null;
}

const logger = createLogger('AppContent');

const AppContent: React.FC<AppContentProps> = ({ 
  communityId, 
  projectId,
  telegramUserId 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const paramId = projectId ? `project_${projectId}` : communityId;
  
  logger.log('AppContent initialized with:', {
    communityId,
    projectId,
    telegramUserId,
    paramId
  });

  const { community, loading } = useCommunityData(paramId);

  useEffect(() => {
    logger.log('Community data or loading state changed:', {
      loading,
      hasData: !!community
    });
    
    if (!loading) {
      setIsLoading(false);
    }
  }, [community, loading]);

  if (isLoading) {
    logger.log('Rendering loading state');
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading community information...</p>
      </div>
    );
  }

  if (!community) {
    logger.log('No community data available');
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-bold">Community Not Found</h2>
        <p className="text-muted-foreground mt-2">
          The community you're looking for doesn't exist or you don't have access to it.
        </p>
      </div>
    );
  }

  logger.log('Rendering community content:', {
    communityName: community.name,
    isGroup: community.is_group,
    hasPlans: community.subscription_plans?.length > 0
  });

  // Convert the subscription plans to the global format
  const globalPlans = convertToGlobalPlans(community.subscription_plans || []);

  return (
    <div className="flex flex-col gap-6">
      <CommunityHeader community={community} />
      <SubscriptionPlansList 
        plans={globalPlans} 
        communityId={community.id}
        telegramUserId={telegramUserId} 
      />
    </div>
  );
};

export default AppContent;
