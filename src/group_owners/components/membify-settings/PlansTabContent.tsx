
import React from "react";
import { Card } from "@/components/ui/card";
import { CurrentPlanCard } from "./CurrentPlanCard";

export const PlansTabContent = () => {
  return (
    <div className="flex flex-col h-full">
      <Card className="shadow-md border border-indigo-100 h-full">
        <CurrentPlanCard />
      </Card>
    </div>
  );
};
