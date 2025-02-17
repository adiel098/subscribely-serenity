
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { PaymentMethodTabs } from "@/features/community/components/payments/PaymentMethodTabs";
import { TelegramPaymentOption } from "@/features/community/components/payments/TelegramPaymentOption";
import { TelegramWebAppContext } from "@/features/community/pages/TelegramMiniApp";
import { useContext, useState } from "react";

export const PaymentMethods = () => {
  const webApp = useContext(TelegramWebAppContext);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Methods</CardTitle>
      </CardHeader>
      <PaymentMethodTabs activeTab="telegram">
        <TelegramPaymentOption 
          isSelected={selectedMethod === 'telegram'}
          onSelect={() => setSelectedMethod('telegram')}
        />
      </PaymentMethodTabs>
    </Card>
  );
};
