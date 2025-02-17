
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaymentMethodTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

export const PaymentMethodTabs = ({ activeTab, onTabChange }: PaymentMethodTabsProps) => (
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
          You'll need your Stripe API keys to enable credit card payments.
        </AlertDescription>
      </Alert>
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="stripe-public">Stripe Public Key</Label>
          <Input id="stripe-public" placeholder="pk_test_..." />
        </div>
        <div className="space-y-2">
          <Label htmlFor="stripe-secret">Stripe Secret Key</Label>
          <Input id="stripe-secret" type="password" placeholder="sk_test_..." />
        </div>
        <Button>Save Stripe Configuration</Button>
      </div>
    </TabsContent>
    <TabsContent value="paypal" className="space-y-4">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Connect your PayPal business account to accept PayPal payments.
        </AlertDescription>
      </Alert>
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="paypal-client">Client ID</Label>
          <Input id="paypal-client" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="paypal-secret">Client Secret</Label>
          <Input id="paypal-secret" type="password" />
        </div>
        <Button>Save PayPal Configuration</Button>
      </div>
    </TabsContent>
    <TabsContent value="crypto" className="space-y-4">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Set up cryptocurrency payment options for your community.
        </AlertDescription>
      </Alert>
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="wallet-address">Wallet Address</Label>
          <Input id="wallet-address" placeholder="Your crypto wallet address" />
        </div>
        <Button>Save Crypto Configuration</Button>
      </div>
    </TabsContent>
  </Tabs>
);
