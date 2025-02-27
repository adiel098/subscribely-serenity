
import React from "react";
import { Plan } from "@/telegram-mini-app/types/community.types";

interface PaymentHeaderProps {
  plan: Plan;
}

export const PaymentHeader: React.FC<PaymentHeaderProps> = ({ plan }) => {
  return (
    <div className="text-center space-y-2">
      <h3 className="text-lg font-semibold">Complete Your Purchase</h3>
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm text-gray-500">Selected Plan</p>
        <p className="font-medium">{plan.name}</p>
        <p className="text-primary text-lg font-bold mt-1">${plan.price}</p>
      </div>
    </div>
  );
};
