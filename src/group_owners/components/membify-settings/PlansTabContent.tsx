
import React from "react";
import { Card } from "@/components/ui/card";
import { CurrentPlanCard } from "./CurrentPlanCard";

export const PlansTabContent = () => {
  return (
    <div className="flex flex-col h-full space-y-6">
      <Card className="shadow-md border border-indigo-100">
        <CurrentPlanCard />
      </Card>
    </div>
  );
};
