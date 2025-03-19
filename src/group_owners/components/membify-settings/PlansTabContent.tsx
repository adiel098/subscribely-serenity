
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard } from "lucide-react";
import { CurrentPlanCard } from "./CurrentPlanCard";
import { PurchaseHistoryTable } from "./PurchaseHistoryTable";

export const PlansTabContent = () => {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Subscription Plan</CardTitle>
          <CardDescription>Manage your current platform subscription</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <CurrentPlanCard />
        </CardContent>
      </Card>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Billing Information</CardTitle>
          <CardDescription>View your billing history and payment information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6">
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <h3 className="font-medium text-blue-700 mb-2 flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Purchase History
              </h3>
              <div className="mt-3 bg-white rounded-lg border overflow-hidden">
                <PurchaseHistoryTable />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
