
import { useState } from "react";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Badge } from "@/features/telegram mini app/components/ui/badge";
import { Button } from "@/features/telegram mini app/components/ui/button";
import { Card } from "@/features/telegram mini app/components/ui/card";
import { TelegramPaymentOption } from "@/features/community/components/payments/TelegramPaymentOption";
import { Plan } from "@/features/telegram mini app/pages/TelegramMiniApp";
import { SuccessScreen } from "./SuccessScreen";

interface PaymentMethodsProps {
  selectedPlan: Plan;
  selectedPaymentMethod: string | null;
  onPaymentMethodSelect: (method: string) => void;
  onCompletePurchase: () => void;
  communityInviteLink: string | null;
  showSuccess: boolean;
}

export const PaymentMethods = ({
  selectedPlan,
  selectedPaymentMethod,
  onPaymentMethodSelect,
  onCompletePurchase,
  communityInviteLink,
  showSuccess,
}: PaymentMethodsProps) => {
  const [processing, setProcessing] = useState(false);

  if (showSuccess) {
    return (
      <SuccessScreen
        plan={selectedPlan}
        inviteLink={communityInviteLink || ""}
      />
    );
  }

  return (
    <div id="payment-methods" className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight">Payment Method</h2>
        <p className="text-muted-foreground">
          Choose how you want to pay for your subscription
        </p>
      </div>

      <div className="grid gap-4">
        <Card
          className={`p-6 cursor-pointer transition-all ${
            selectedPaymentMethod === "telegram"
              ? "border-primary ring-2 ring-primary ring-offset-2"
              : "hover:border-primary/50"
          }`}
          onClick={() => onPaymentMethodSelect("telegram")}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img
                src="/telegram-payment.png"
                alt="Telegram Payments"
                className="w-12 h-12"
              />
              <div>
                <h3 className="font-medium">Telegram Payments</h3>
                <p className="text-sm text-muted-foreground">
                  Pay securely through Telegram
                </p>
              </div>
            </div>
            {selectedPaymentMethod === "telegram" && (
              <CheckCircle2 className="h-5 w-5 text-primary" />
            )}
          </div>
        </Card>
      </div>

      {selectedPaymentMethod && (
        <Button
          className="w-full gap-2"
          size="lg"
          onClick={onCompletePurchase}
          disabled={processing}
        >
          {processing ? (
            "Processing..."
          ) : (
            <>
              Complete Purchase
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      )}
    </div>
  );
};
