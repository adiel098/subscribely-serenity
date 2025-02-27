
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { CreditCard, Landmark } from "lucide-react";

interface PaymentOptionsProps {
  selectedPaymentMethod: string | null;
  onPaymentMethodSelect: (method: string) => void;
  stripeConfig: any;
  isLoading?: boolean;
}

export const PaymentOptions = ({
  selectedPaymentMethod,
  onPaymentMethodSelect,
  stripeConfig,
  isLoading = false
}: PaymentOptionsProps) => {
  // Show all payment options by default, filter if stripe not available
  const showStripe = stripeConfig !== null;
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Payment Method</h3>
        <div className="space-y-3">
          <Skeleton className="h-[72px] w-full rounded-md" />
          <Skeleton className="h-[72px] w-full rounded-md" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Payment Method</h3>
      <RadioGroup
        value={selectedPaymentMethod || ""}
        onValueChange={onPaymentMethodSelect}
        className="space-y-3"
      >
        <Card className={`transition-all ${selectedPaymentMethod === 'telegram' ? 'border-primary' : ''}`}>
          <CardContent className="p-0">
            <Label
              htmlFor="telegram"
              className="flex cursor-pointer items-center space-x-4 p-4"
            >
              <RadioGroupItem value="telegram" id="telegram" />
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-blue-600"
                  >
                    <path d="m22 2-7 20-4-9-9-4Z" />
                    <path d="M22 2 11 13" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Telegram Payments</p>
                  <p className="text-sm text-gray-500">Pay directly through Telegram</p>
                </div>
              </div>
            </Label>
          </CardContent>
        </Card>

        {showStripe && (
          <Card className={`transition-all ${selectedPaymentMethod === 'stripe' ? 'border-primary' : ''}`}>
            <CardContent className="p-0">
              <Label
                htmlFor="stripe"
                className="flex cursor-pointer items-center space-x-4 p-4"
              >
                <RadioGroupItem value="stripe" id="stripe" />
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">Credit Card</p>
                    <p className="text-sm text-gray-500">Pay with Visa, Mastercard, etc.</p>
                  </div>
                </div>
              </Label>
            </CardContent>
          </Card>
        )}
        
        <Card className={`transition-all ${selectedPaymentMethod === 'bank_transfer' ? 'border-primary' : ''}`}>
          <CardContent className="p-0">
            <Label
              htmlFor="bank_transfer"
              className="flex cursor-pointer items-center space-x-4 p-4"
            >
              <RadioGroupItem value="bank_transfer" id="bank_transfer" />
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Landmark className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Bank Transfer</p>
                  <p className="text-sm text-gray-500">Pay via bank transfer</p>
                </div>
              </div>
            </Label>
          </CardContent>
        </Card>
      </RadioGroup>
    </div>
  );
};
