import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PaymentMethodTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const PaymentMethodTabs = ({ activeTab, onTabChange }: PaymentMethodTabsProps) => {
  return (
    <div className="w-full">
      <div className="flex space-x-4">
        <button
          className={`px-4 py-2 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground hover:bg-muted hover:text-muted-foreground ${activeTab === 'stripe' ? 'bg-secondary text-secondary-foreground' : ''}`}
          onClick={() => onTabChange('stripe')}
        >
          Stripe
        </button>
        <button
          className={`px-4 py-2 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground hover:bg-muted hover:text-muted-foreground ${activeTab === 'paypal' ? 'bg-secondary text-secondary-foreground' : ''}`}
          onClick={() => onTabChange('paypal')}
        >
          PayPal
        </button>
        <button
          className={`px-4 py-2 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground hover:bg-muted hover:text-muted-foreground ${activeTab === 'crypto' ? 'bg-secondary text-secondary-foreground' : ''}`}
          onClick={() => onTabChange('crypto')}
        >
          Crypto
        </button>
      </div>

      <div className="mt-4">
        {activeTab === 'stripe' && (
          <Card>
            <CardHeader>
              <CardTitle>Stripe Configuration</CardTitle>
              <CardDescription>Enter your Stripe API keys</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Stripe configuration form goes here</p>
            </CardContent>
          </Card>
        )}

        {activeTab === 'paypal' && (
          <Card>
            <CardHeader>
              <CardTitle>PayPal Configuration</CardTitle>
              <CardDescription>Enter your PayPal API keys</CardDescription>
            </CardHeader>
            <CardContent>
              <p>PayPal configuration form goes here</p>
            </CardContent>
          </Card>
        )}

        {activeTab === 'crypto' && (
          <Card>
            <CardHeader>
              <CardTitle>Crypto Configuration</CardTitle>
              <CardDescription>Enter your Crypto wallet details</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Crypto configuration form goes here</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
