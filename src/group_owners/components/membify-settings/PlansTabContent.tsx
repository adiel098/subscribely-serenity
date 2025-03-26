import React from "react";
import { Card } from "@/components/ui/card";
import { CurrentPlanCard } from "./CurrentPlanCard";
export const PlansTabContent = () => {
  return <div className="flex flex-col h-full px-0 py-0">
      <Card className="shadow-md border border-indigo-100 h-full max-w-4xl mx-auto w-full">
        <CurrentPlanCard />
      </Card>
    </div>;
};