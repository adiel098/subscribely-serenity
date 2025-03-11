
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, CreditCard, CalendarClock } from "lucide-react";

interface AnalyticsOverviewProps {
  averageSubscriptionDuration: number;
  mostPopularPlan: string;
  mostPopularPlanPrice: number;
  mostActiveDay: string;
  renewalRate: number;
}

export const AnalyticsOverview: React.FC<AnalyticsOverviewProps> = ({
  averageSubscriptionDuration,
  mostPopularPlan,
  mostPopularPlanPrice,
  mostActiveDay,
  renewalRate
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      <Card className="shadow-sm hover:shadow-md transition-shadow border border-gray-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-md font-semibold text-gray-800 flex items-center">
            <Clock className="h-4 w-4 mr-2 text-indigo-500" />
            Subscription Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Average Subscription Duration</p>
              <p className="text-xl font-semibold">{averageSubscriptionDuration} days</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Renewal Rate</p>
              <p className="text-xl font-semibold">{renewalRate}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm hover:shadow-md transition-shadow border border-gray-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-md font-semibold text-gray-800 flex items-center">
            <CreditCard className="h-4 w-4 mr-2 text-indigo-500" />
            Plan Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Most Popular Plan</p>
              <p className="text-xl font-semibold">{mostPopularPlan}</p>
              <p className="text-sm text-gray-500">${mostPopularPlanPrice}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Most Active Day</p>
              <p className="text-xl font-semibold">{mostActiveDay}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
