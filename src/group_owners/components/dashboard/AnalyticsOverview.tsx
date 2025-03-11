
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Clock, 
  CreditCard, 
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
        {/* Two items per row */}
        <div className="grid grid-cols-2 gap-2">
          {/* Subscription Analysis */}
          <div className="p-3 bg-transparent border border-gray-200 rounded-md">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 mb-1">
                <Clock className="h-3 w-3 text-gray-500" />
                <p className="text-xs text-gray-500">Avg. Subscription</p>
              </div>
              <p className="text-sm font-bold text-gray-800">{averageSubscriptionDuration} days</p>
            </div>
          </div>
          
          {/* Most Popular Plan */}
          <div className="p-3 bg-transparent border border-gray-200 rounded-md">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 mb-1">
                <CreditCard className="h-3 w-3 text-gray-500" />
                <p className="text-xs text-gray-500">Most Popular</p>
              </div>
              <p className="text-sm font-bold text-gray-800">{mostPopularPlan}</p>
              <p className="text-xs font-medium text-green-600">${mostPopularPlanPrice}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {/* Renewal Rate */}
          <div className="flex flex-col items-center p-3 bg-transparent border border-gray-200 rounded-md">
            <div className="flex items-center gap-1 mb-1">
              <TrendingUp className="h-3 w-3 text-gray-500" />
              <p className="text-xs text-gray-500">Renewal Rate</p>
            </div>
            <p className="text-sm font-bold text-gray-800">{renewalRate}%</p>
          </div>
        </div>
        
        {/* Renewal Rate Progress Bar */}
        <div>
          <p className="text-xs text-gray-500 mb-1">Renewal Progress</p>
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
