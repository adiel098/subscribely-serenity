
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-base font-medium text-gray-800 flex items-center gap-2">
            <Clock className="h-4 w-4 text-indigo-500" />
            Subscription Analysis
          </h3>
        </div>
        <CardContent className="p-5">
          <div className="space-y-4">
            <div className="p-3 bg-white border border-gray-200 rounded-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Average Duration</p>
                  <p className="text-xl font-bold text-gray-800">{averageSubscriptionDuration} days</p>
                </div>
                <Clock className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div className="p-3 bg-white border border-gray-200 rounded-md">
              <div>
                <p className="text-sm text-gray-500 mb-1">Renewal Rate</p>
                <div className="flex items-center gap-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-indigo-500 h-2 rounded-full" 
                      style={{ width: `${Math.min(renewalRate, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-base font-semibold text-gray-800 min-w-[45px] text-right">{renewalRate}%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-base font-medium text-gray-800 flex items-center gap-2">
            <Award className="h-4 w-4 text-green-500" />
            Plan Performance
          </h3>
        </div>
        <CardContent className="p-5">
          <div className="space-y-4">
            <div className="p-3 bg-white border border-gray-200 rounded-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Most Popular Plan</p>
                  <p className="text-xl font-bold text-gray-800">{mostPopularPlan}</p>
                  <p className="text-sm font-medium text-green-600">${mostPopularPlanPrice}</p>
                </div>
                <CreditCard className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div className="p-3 bg-white border border-gray-200 rounded-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Most Active Day</p>
                  <p className="text-xl font-bold text-gray-800">{mostActiveDay}</p>
                </div>
                <CalendarClock className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
