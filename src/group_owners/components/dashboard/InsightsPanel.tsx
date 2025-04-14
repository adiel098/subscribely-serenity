import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Award, BarChart3, Repeat } from "lucide-react";
import { InsightData } from "@/group_owners/hooks/dashboard/types";

interface InsightsPanelProps {
  insights: InsightData;
}

export const InsightsPanel: React.FC<InsightsPanelProps> = ({ insights = {} }) => {
  const {
    averageSubscriptionDuration = 0,
    mostPopularPlan = 'No Plan',
    mostPopularPlanPrice = 0,
    renewalRate = 0,
    potentialRevenue = 0
  } = insights || {};

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-purple-600" />
          <span>Insights</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InsightCard
            title="Avg. Subscription Length"
            value={`${averageSubscriptionDuration} days`}
            icon={<Clock className="h-4 w-4 text-blue-600" />}
          />
          
          <InsightCard
            title="Most Popular Plan"
            value={mostPopularPlan}
            subValue={`$${mostPopularPlanPrice.toFixed(2)}`}
            icon={<Award className="h-4 w-4 text-amber-600" />}
          />
          
          <InsightCard
            title="Renewal Rate"
            value={`${renewalRate}%`}
            icon={<Repeat className="h-4 w-4 text-green-600" />}
          />
          
          <InsightCard
            title="Potential Revenue"
            value={`$${potentialRevenue.toFixed(2)}`}
            icon={<BarChart3 className="h-4 w-4 text-purple-600" />}
          />
        </div>
      </CardContent>
    </Card>
  );
};

interface InsightCardProps {
  title: string;
  value: string;
  subValue?: string;
  icon: React.ReactNode;
}

const InsightCard: React.FC<InsightCardProps> = ({ 
  title, 
  value, 
  subValue, 
  icon 
}) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex items-center gap-2 mb-1">
        <div className="bg-white p-1.5 rounded-md shadow-sm">
          {icon}
        </div>
        <p className="text-xs font-medium text-gray-500">{title}</p>
      </div>
      <p className="text-lg font-semibold">{value}</p>
      {subValue && (
        <p className="text-xs text-gray-500">{subValue}</p>
      )}
    </div>
  );
};
