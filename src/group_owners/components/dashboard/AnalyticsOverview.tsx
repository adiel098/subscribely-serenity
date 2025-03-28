import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Clock, 
  CreditCard, 
  TrendingUp, 
  Award 
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  
  return (
    <Card className="h-full">
      <CardHeader className={`pb-0 ${isMobile ? 'p-2' : 'pb-2'}`}>
        <CardTitle className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-800 flex items-center gap-1.5`}>
          <Award className={`${isMobile ? 'h-3.5 w-3.5' : 'h-4 w-4'} text-indigo-500`} />
          Plan Analytics
        </CardTitle>
      </CardHeader>
      
      <CardContent className={`pt-0 space-y-2 ${isMobile ? 'p-2' : ''}`}>
        {/* Stack items vertically on mobile, two per row on desktop */}
        <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-2`}>
          {/* Subscription Analysis */}
          <div className="p-2 bg-transparent border border-gray-200 rounded-md">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 mb-0.5">
                <Clock className={`${isMobile ? 'h-2.5 w-2.5' : 'h-3 w-3'} text-gray-500`} />
                <p className={`${isMobile ? 'text-[8px]' : 'text-xs'} text-gray-500`}>Avg. Subscription</p>
              </div>
              <p className={`${isMobile ? 'text-xs' : 'text-sm'} font-bold text-gray-800`}>{averageSubscriptionDuration} days</p>
            </div>
          </div>
          
          {/* Most Popular Plan */}
          <div className="p-2 bg-transparent border border-gray-200 rounded-md">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 mb-0.5">
                <CreditCard className={`${isMobile ? 'h-2.5 w-2.5' : 'h-3 w-3'} text-gray-500`} />
                <p className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-gray-500`}>Most Popular</p>
              </div>
              <p className={`${isMobile ? 'text-xs' : 'text-sm'} font-bold text-gray-800 truncate max-w-full`}>{mostPopularPlan}</p>
              <p className={`${isMobile ? 'text-[10px]' : 'text-xs'} font-medium text-green-600`}>${mostPopularPlanPrice}</p>
            </div>
          </div>
        </div>

        {/* Renewal Rate in its own row */}
        <div className="grid grid-cols-1 gap-2">
          {/* Renewal Rate */}
          
        </div>
        
        {/* Renewal Rate Progress Bar */}
        <div>
          <p className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-gray-500 mb-0.5`}>Renewal Rate</p>
          <div className="flex items-center gap-1.5">
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-indigo-500 h-1.5 rounded-full" 
                style={{ width: `${Math.min(renewalRate, 100)}%` }}
              ></div>
            </div>
            <span className={`${isMobile ? 'text-[10px]' : 'text-xs'} font-semibold text-gray-800 min-w-[26px] text-right`}>{renewalRate}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
