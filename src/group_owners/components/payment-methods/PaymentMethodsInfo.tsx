
import React from "react";
import { Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const PaymentMethodsInfo = () => {
  return (
    <Card className="bg-blue-50 border-blue-200 mb-8">
      <CardContent className="pt-6 pb-5">
        <div className="flex gap-3">
          <div className="bg-blue-100 text-blue-700 p-2 rounded-full h-fit">
            <Info className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-medium text-blue-800 mb-1">
              Sharing payment methods between communities
            </h3>
            <p className="text-sm text-blue-600">
              Payment methods set as "default" will be available in all your communities.
              Mark a payment method as default to save time and avoid reconfiguring in each community.
              Default payment methods are marked with a star icon.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
