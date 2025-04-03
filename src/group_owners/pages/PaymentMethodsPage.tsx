
import React, { useState } from "react";
import { usePaymentMethodsPage } from "@/group_owners/hooks/usePaymentMethodsPage";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CreditCard, Loader2, Wallet, Bitcoin } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { PaymentMethodConfig } from "@/group_owners/components/payments/PaymentMethodConfig";
import { CryptoPaymentConfig } from "@/group_owners/components/payments/CryptoPaymentConfig";
import { PAYMENT_METHOD_IMAGES } from "@/group_owners/data/paymentMethodsData";

export function PaymentMethodsPage() {
  const {
    paymentMethods,
    isLoading,
    handleTogglePaymentMethod,
  } = usePaymentMethodsPage();

  const [activeTab, setActiveTab] = useState<string>("stripe");

  if (isLoading) {
    return (
      <div className="container max-w-6xl py-6 space-y-8">
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      </div>
    );
  }

  const getMethodDetails = (provider: string) => {
    switch (provider) {
      case "stripe":
        return {
          title: "Stripe",
          description: "Accept credit cards, Google Pay, and Apple Pay",
          icon: <CreditCard className="h-5 w-5" />,
          imageSrc: PAYMENT_METHOD_IMAGES.stripe,
        };
      case "paypal":
        return {
          title: "PayPal",
          description: "Accept PayPal payments and other payment methods",
          icon: <Wallet className="h-5 w-5" />,
          imageSrc: PAYMENT_METHOD_IMAGES.paypal,
        };
      case "crypto":
        return {
          title: "Cryptocurrency",
          description: "Accept Bitcoin, Ethereum, and other cryptocurrencies",
          icon: <Bitcoin className="h-5 w-5" />,
          imageSrc: PAYMENT_METHOD_IMAGES.crypto,
        };
      default:
        return {
          title: provider,
          description: "Payment method",
          icon: <CreditCard className="h-5 w-5" />,
          imageSrc: "",
        };
    }
  };

  return (
    <div className="container max-w-6xl py-6 space-y-8">
      <PageHeader
        title="Payment Methods"
        description="Configure and manage payment methods for your subscriptions"
      />

      <Alert variant="default" className="bg-blue-50 border-blue-200 text-blue-800">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-700">
          Enable different payment methods for your subscribers. Only enabled payment methods will be available for your members.
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger
            value="stripe"
            className="flex items-center gap-2"
            onClick={() => setActiveTab("stripe")}
          >
            <CreditCard className="h-4 w-4" />
            Stripe
          </TabsTrigger>
          <TabsTrigger
            value="paypal"
            className="flex items-center gap-2"
            onClick={() => setActiveTab("paypal")}
          >
            <Wallet className="h-4 w-4" />
            PayPal
          </TabsTrigger>
          <TabsTrigger
            value="crypto"
            className="flex items-center gap-2"
            onClick={() => setActiveTab("crypto")}
          >
            <Bitcoin className="h-4 w-4" />
            Crypto
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stripe" className="space-y-4">
          <PaymentMethodCard
            provider="stripe"
            paymentMethod={paymentMethods?.find((method) => method.provider === "stripe")}
            onToggle={handleTogglePaymentMethod}
          >
            <PaymentMethodConfig
              provider="stripe"
              onSuccess={() => {}}
              imageSrc={PAYMENT_METHOD_IMAGES.stripe}
            />
          </PaymentMethodCard>
        </TabsContent>

        <TabsContent value="paypal" className="space-y-4">
          <PaymentMethodCard
            provider="paypal"
            paymentMethod={paymentMethods?.find((method) => method.provider === "paypal")}
            onToggle={handleTogglePaymentMethod}
          >
            <PaymentMethodConfig
              provider="paypal"
              onSuccess={() => {}}
              imageSrc={PAYMENT_METHOD_IMAGES.paypal}
            />
          </PaymentMethodCard>
        </TabsContent>

        <TabsContent value="crypto" className="space-y-4">
          <PaymentMethodCard
            provider="crypto"
            paymentMethod={paymentMethods?.find((method) => method.provider === "crypto")}
            onToggle={handleTogglePaymentMethod}
          >
            <CryptoPaymentConfig onSuccess={() => {}} />
          </PaymentMethodCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface PaymentMethodCardProps {
  provider: string;
  paymentMethod: any;
  onToggle: (id: string, isActive: boolean) => void;
  children: React.ReactNode;
}

function PaymentMethodCard({
  provider,
  paymentMethod,
  onToggle,
  children,
}: PaymentMethodCardProps) {
  const details = getMethodDetails(provider);

  return (
    <Card className="border-gray-200 shadow-sm overflow-hidden">
      <CardHeader className="border-b bg-gray-50">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-md border">
              {details.icon}
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {details.title}
                <Badge
                  variant={paymentMethod?.is_active ? "default" : "secondary"}
                  className="ml-2"
                >
                  {paymentMethod?.is_active ? "Active" : "Inactive"}
                </Badge>
              </CardTitle>
              <CardDescription>{details.description}</CardDescription>
            </div>
          </div>
          <div className="flex items-center">
            <Switch
              checked={paymentMethod?.is_active || false}
              onCheckedChange={(checked) =>
                onToggle(paymentMethod?.id, checked)
              }
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="p-6">{children}</div>
      </CardContent>
      <CardFooter className="bg-gray-50 border-t p-4 text-sm text-gray-500">
        These settings apply to all your groups and communities
      </CardFooter>
    </Card>
  );
}

export default PaymentMethodsPage;
