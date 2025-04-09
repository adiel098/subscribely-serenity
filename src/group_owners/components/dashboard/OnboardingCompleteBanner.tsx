
import React, { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckCircle, X } from "lucide-react";

export const OnboardingCompleteBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  
  // Example check - would need to be replaced with actual onboarding completion check
  // For now we'll just return true to show the banner
  const isOnboardingComplete = true;
  
  if (!isVisible || !isOnboardingComplete) {
    return null;
  }
  
  return (
    <Alert className="relative mb-6 border-green-200 bg-green-50">
      <button 
        className="absolute right-4 top-4 text-green-600 hover:text-green-800" 
        onClick={() => setIsVisible(false)}
      >
        <X className="h-4 w-4" />
      </button>
      <CheckCircle className="h-4 w-4 text-green-600" />
      <AlertTitle className="text-green-800">Setup complete!</AlertTitle>
      <AlertDescription className="text-green-700 flex flex-col sm:flex-row sm:items-center gap-3 mt-1">
        <span>Your account is fully set up and ready to manage subscribers.</span>
        <Button 
          variant="outline" 
          className="bg-white border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800 w-full sm:w-auto"
        >
          View quick tutorials
        </Button>
      </AlertDescription>
    </Alert>
  );
};
