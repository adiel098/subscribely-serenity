
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Gift } from "lucide-react";

export const PaymentHeader = () => {
  return (
    <div className="text-center space-y-2">
      <Badge variant="secondary" className="px-4 py-1.5">
        <Gift className="h-4 w-4 mr-2" />
        Final Step
      </Badge>
      <h2 className="text-3xl font-bold text-gray-900">
        Choose Payment Method
      </h2>
      <p className="text-gray-600">
        Select your preferred way to pay
      </p>
    </div>
  );
};
