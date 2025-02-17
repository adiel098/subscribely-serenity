
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { PaymentMethodCard } from "@/features/community/components/payments/PaymentMethodCard";
import { PaymentMethodTabs } from "@/features/community/components/payments/PaymentMethodTabs";
import { usePaymentMethods } from "@/hooks/usePaymentMethods";
import { TelegramPaymentOption } from "@/features/community/components/payments/TelegramPaymentOption";
import { TelegramWebAppContext } from "@/features/community/pages/TelegramMiniApp";
import { useContext } from "react";

export const PaymentMethods = () => {
  const webApp = useContext(TelegramWebAppContext);
  const { data: paymentMethods, isLoading } = usePaymentMethods();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Methods</CardTitle>
      </CardHeader>
      <PaymentMethodTabs>
        <TelegramPaymentOption />
        {paymentMethods?.map((method) => (
          <PaymentMethodCard key={method.id} method={method} />
        ))}
      </PaymentMethodTabs>
    </Card>
  );
};
