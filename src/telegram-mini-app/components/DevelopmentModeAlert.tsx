
import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Info } from "lucide-react";

interface DevelopmentModeAlertProps {
  telegramWebAppAvailable: boolean;
}

export const DevelopmentModeAlert: React.FC<DevelopmentModeAlertProps> = ({ 
  telegramWebAppAvailable 
}) => {
  return (
    <Alert 
      variant={telegramWebAppAvailable ? "default" : "destructive"} 
      className="mb-4 mx-4 mt-4"
    >
      {telegramWebAppAvailable ? (
        <Info className="h-4 w-4" />
      ) : (
        <AlertTriangle className="h-4 w-4" />
      )}
      <AlertTitle>Development Mode</AlertTitle>
      <AlertDescription>
        {telegramWebAppAvailable 
          ? "Running in development mode with Telegram WebApp available."
          : "Running outside of Telegram environment. Using mock data for development."}
      </AlertDescription>
    </Alert>
  );
};
