
import React from "react";
import { AlertCircle } from "lucide-react";
import { useCommunityRequirements } from "@/group_owners/hooks/useCommunityRequirements";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export const CommunityRequirementsBanner: React.FC = () => {
  const { data: requirements, isLoading } = useCommunityRequirements();
  
  // Check if we have any requirements that are not met
  const hasRequirements = requirements && requirements.length > 0;
  
  if (isLoading || !hasRequirements) return null;
  
  return (
    <Alert variant="warning" className="py-1.5 px-3 flex items-center h-9 bg-amber-50 border-amber-200">
      <AlertCircle className="h-4 w-4 text-amber-500" />
      <AlertTitle className="text-xs ml-2 font-medium">Action required</AlertTitle>
      <AlertDescription className="text-xs ml-1">
        Complete your setup to accept payments
      </AlertDescription>
    </Alert>
  );
};
