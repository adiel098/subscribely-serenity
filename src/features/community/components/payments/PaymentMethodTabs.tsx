
import { useState } from "react";
import { Input } from "@/features/community/components/ui/input";
import { Label } from "@/features/community/components/ui/label";
import { Alert, AlertDescription } from "@/features/community/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/features/community/components/ui/tabs";
import { AlertCircle } from "lucide-react";
import { Button } from "@/features/community/components/ui/button";

interface PaymentMethodTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

export const PaymentMethodTabs = ({
  activeTab,
  onTabChange,
}: PaymentMethodTabsProps) => {
  const [stripeConfig, setStripeConfig] = useState({
    publishableKey: "",
    secretKey: "",
  });

  const [paypalConfig, setPaypalConfig] = useState({
    clientId: "",
    clientSecret: "",
  });

  const [cryptoConfig, setCryptoConfig] = useState({
    walletAddress: "",
  });

  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="stripe">Stripe</TabsTrigger>
        <TabsTrigger value="paypal">PayPal</TabsTrigger>
        <TabsTrigger value="crypto">Crypto</TabsTrigger>
      </TabsList>

      <TabsContent value="stripe" className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Enter your Stripe API keys to enable card payments
          </AlertDescription>
        </Alert>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="publishable-key">Publishable Key</Label>
            <Input
              id="publishable-key"
              value={stripeConfig.publishableKey}
              onChange={(e) =>
                setStripeConfig((prev) => ({
                  ...prev,
                  publishableKey: e.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="secret-key">Secret Key</Label>
            <Input
              id="secret-key"
              type="password"
              value={stripeConfig.secretKey}
              onChange={(e) =>
                setStripeConfig((prev) => ({
                  ...prev,
                  secretKey: e.target.value,
                }))
              }
            />
          </div>
          <Button className="w-full">Save Stripe Configuration</Button>
        </div>
      </TabsContent>

      <TabsContent value="paypal" className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Enter your PayPal API credentials to enable PayPal payments
          </AlertDescription>
        </Alert>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="client-id">Client ID</Label>
            <Input
              id="client-id"
              value={paypalConfig.clientId}
              onChange={(e) =>
                setPaypalConfig((prev) => ({
                  ...prev,
                  clientId: e.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="client-secret">Client Secret</Label>
            <Input
              id="client-secret"
              type="password"
              value={paypalConfig.clientSecret}
              onChange={(e) =>
                setPaypalConfig((prev) => ({
                  ...prev,
                  clientSecret: e.target.value,
                }))
              }
            />
          </div>
          <Button className="w-full">Save PayPal Configuration</Button>
        </div>
      </TabsContent>

      <TabsContent value="crypto" className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Enter your cryptocurrency wallet address to accept crypto payments
          </AlertDescription>
        </Alert>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="wallet-address">Wallet Address</Label>
            <Input
              id="wallet-address"
              value={cryptoConfig.walletAddress}
              onChange={(e) =>
                setCryptoConfig((prev) => ({
                  ...prev,
                  walletAddress: e.target.value,
                }))
              }
            />
          </div>
          <Button className="w-full">Save Crypto Configuration</Button>
        </div>
      </TabsContent>
    </Tabs>
  );
};
