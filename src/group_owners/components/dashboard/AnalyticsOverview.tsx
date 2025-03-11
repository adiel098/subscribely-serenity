
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, CreditCard, CalendarClock, TrendingUp, Award } from "lucide-react";

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
      <Card className="overflow-hidden relative bg-gradient-to-br from-white to-indigo-50 border-none shadow-md rounded-xl">
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-100 rounded-bl-full opacity-50"></div>
        <CardHeader className="pb-2 relative z-10">
          <CardTitle className="text-md font-semibold text-gray-800 flex items-center gap-2">
            <div className="bg-indigo-100 p-2 rounded-full">
              <Clock className="h-4 w-4 text-indigo-600" />
            </div>
            Subscription Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="space-y-6">
            <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
              <div>
                <p className="text-sm text-gray-500">Average Duration</p>
                <p className="text-xl font-bold text-gray-800">{averageSubscriptionDuration} days</p>
              </div>
              <TrendingUp className="h-5 w-5 text-indigo-400" />
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
              <div>
                <p className="text-sm text-gray-500">Renewal Rate</p>
                <div className="flex items-center mt-1">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-indigo-600 h-2.5 rounded-full" 
                      style={{ width: `${Math.min(renewalRate, 100)}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 text-lg font-semibold text-gray-800">{renewalRate}%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden relative bg-gradient-to-br from-white to-green-50 border-none shadow-md rounded-xl">
        <div className="absolute top-0 right-0 w-24 h-24 bg-green-100 rounded-bl-full opacity-50"></div>
        <CardHeader className="pb-2 relative z-10">
          <CardTitle className="text-md font-semibold text-gray-800 flex items-center gap-2">
            <div className="bg-green-100 p-2 rounded-full">
              <Award className="h-4 w-4 text-green-600" />
            </div>
            Plan Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="space-y-6">
            <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
              <div>
                <p className="text-sm text-gray-500">Most Popular Plan</p>
                <p className="text-xl font-bold text-gray-800">{mostPopularPlan}</p>
                <p className="text-sm font-medium text-green-600">${mostPopularPlanPrice}</p>
              </div>
              <CreditCard className="h-5 w-5 text-green-400" />
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
              <div>
                <p className="text-sm text-gray-500">Most Active Day</p>
                <p className="text-xl font-bold text-gray-800">{mostActiveDay}</p>
              </div>
              <CalendarClock className="h-5 w-5 text-green-400" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
