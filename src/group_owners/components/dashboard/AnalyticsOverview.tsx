
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  Clock, 
  CreditCard, 
  CalendarClock, 
  TrendingUp, 
  Award 
} from "lucide-react";

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
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-800 flex items-center gap-2">
          <Award className="h-4 w-4 text-indigo-500" />
          Plan Analytics
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-3">
        {/* Subscription Analysis */}
        <div className="p-3 bg-white border border-gray-200 rounded-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Avg. Subscription</p>
              <p className="text-sm font-bold text-gray-800">{averageSubscriptionDuration} days</p>
            </div>
            <Clock className="h-4 w-4 text-gray-400" />
          </div>
        </div>
        
        {/* Most Popular Plan */}
        <div className="p-3 bg-white border border-gray-200 rounded-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Most Popular</p>
              <p className="text-sm font-bold text-gray-800">{mostPopularPlan}</p>
              <p className="text-xs font-medium text-green-600">${mostPopularPlanPrice}</p>
            </div>
            <CreditCard className="h-4 w-4 text-gray-400" />
          </div>
        </div>

        {/* Most Active Day */}
        <div className="p-3 bg-white border border-gray-200 rounded-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Most Active Day</p>
              <p className="text-sm font-bold text-gray-800">{mostActiveDay}</p>
            </div>
            <CalendarClock className="h-4 w-4 text-gray-400" />
          </div>
        </div>
        
        {/* Renewal Rate */}
        <div>
          <p className="text-xs text-gray-500 mb-1">Renewal Rate</p>
          <div className="flex items-center gap-2">
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-indigo-500 h-1.5 rounded-full" 
                style={{ width: `${Math.min(renewalRate, 100)}%` }}
              ></div>
            </div>
            <span className="text-xs font-semibold text-gray-800 min-w-[32px] text-right">{renewalRate}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
