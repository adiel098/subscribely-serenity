
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

export const PaymentMethodsInfo = () => {
  return (
    <Alert className="bg-blue-50 border-blue-200 text-blue-800">
      <InfoIcon className="h-5 w-5 text-blue-600" />
      <AlertTitle className="text-blue-800 mb-1">Global Payment Methods</AlertTitle>
      <AlertDescription className="text-blue-700">
        Payment methods configured here will be available for all your communities and groups.
        This unified approach ensures consistent payment options across your entire platform.
      </AlertDescription>
    </Alert>
  );
};
