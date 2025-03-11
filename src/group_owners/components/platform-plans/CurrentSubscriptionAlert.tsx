
import React from "react";
import { Package } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface CurrentSubscriptionAlertProps {
  currentSubscription: any | null;
}

export const CurrentSubscriptionAlert = ({ currentSubscription }: CurrentSubscriptionAlertProps) => {
  if (!currentSubscription) return null;
  
  return (
    <Alert className="mb-8 bg-blue-50 border-blue-200">
      <Package className="h-4 w-4 text-blue-600" />
      <AlertTitle className="text-blue-800 font-medium">Active Subscription</AlertTitle>
      <AlertDescription className="text-blue-700">
        You're currently subscribed to the <span className="font-semibold">{currentSubscription.platform_plans?.name}</span> plan. 
        {currentSubscription.subscription_end_date && (
          <span> Your subscription is valid until {new Date(currentSubscription.subscription_end_date).toLocaleDateString()}.</span>
        )}
      </AlertDescription>
    </Alert>
  );
};
