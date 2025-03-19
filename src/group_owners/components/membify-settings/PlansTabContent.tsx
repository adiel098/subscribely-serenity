
import React from "react";
import { Card } from "@/components/ui/card";
import { CurrentPlanCard } from "./CurrentPlanCard";
import { PurchaseHistoryTable } from "./PurchaseHistoryTable";

export const PlansTabContent = () => {
  return (
    <div className="flex flex-col h-full space-y-6">
      <Card className="shadow-md border border-indigo-100">
        <CurrentPlanCard />
      </Card>
      
      <Card className="shadow-md border border-indigo-100 flex-1">
        <PurchaseHistoryTable />
      </Card>
    </div>
  );
};
