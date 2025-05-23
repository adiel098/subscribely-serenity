
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  CheckCircle, 
  Clock, 
  XCircle,
  DollarSign,
  Wallet
} from "lucide-react";
import { PaymentStatistics } from "@/group_owners/hooks/dashboard/types";
import { useIsMobile } from "@/hooks/use-mobile";

interface PaymentAnalyticsProps {
  paymentStats: PaymentStatistics;
}

export const PaymentAnalytics: React.FC<PaymentAnalyticsProps> = ({
  paymentStats
}) => {
  const isMobile = useIsMobile();
  const totalPayments = paymentStats.completed + paymentStats.pending + paymentStats.failed;
  const completedPercentage = totalPayments > 0 
    ? Math.round((paymentStats.completed / totalPayments) * 100) 
    : 0;
  
  return (
    <Card className="h-full">
      <CardHeader className={`pb-0 ${isMobile ? 'p-2' : 'pb-1'}`}>
        <CardTitle className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-800 flex items-center gap-1.5`}>
          <DollarSign className={`${isMobile ? 'h-3.5 w-3.5' : 'h-4 w-4'} text-green-500`} />
          Payment Analytics
        </CardTitle>
      </CardHeader>
      
      <CardContent className={`pt-0 pb-3 space-y-2 ${isMobile ? 'p-2' : ''}`}>
        {/* Transaction Status Section - 2 per row */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col items-center p-2 bg-transparent border border-gray-200 rounded-md">
            <div className="flex items-center gap-1 mb-0.5">
              <CheckCircle className={`${isMobile ? 'w-2.5 h-2.5' : 'w-3 h-3'} text-emerald-500`} />
              <span className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-gray-600`}>Done</span>
            </div>
            <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-semibold text-gray-800`}>{paymentStats.completed}</span>
          </div>
          <div className="flex flex-col items-center p-2 bg-transparent border border-gray-200 rounded-md">
            <div className="flex items-center gap-1 mb-0.5">
              <Clock className={`${isMobile ? 'w-2.5 h-2.5' : 'w-3 h-3'} text-yellow-500`} />
              <span className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-gray-600`}>Pending</span>
            </div>
            <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-semibold text-gray-800`}>{paymentStats.pending}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col items-center p-2 bg-transparent border border-gray-200 rounded-md">
            <div className="flex items-center gap-1 mb-0.5">
              <XCircle className={`${isMobile ? 'w-2.5 h-2.5' : 'w-3 h-3'} text-red-500`} />
              <span className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-gray-600`}>Failed</span>
            </div>
            <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-semibold text-gray-800`}>{paymentStats.failed}</span>
          </div>
          
          {/* Transaction Total */}
          <div className="flex flex-col items-center p-2 bg-transparent border border-gray-200 rounded-md">
            <div className="flex items-center gap-1 mb-0.5">
              <Wallet className={`${isMobile ? 'w-2.5 h-2.5' : 'w-3 h-3'} text-gray-500`} />
              <span className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-gray-600`}>Total</span>
            </div>
            <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-semibold text-gray-800`}>{totalPayments}</span>
          </div>
        </div>

        {/* Success Rate */}
        <div>
          <p className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-gray-500 mb-0.5`}>Success Rate</p>
          <div className="flex items-center gap-2">
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-emerald-500 h-1.5 rounded-full" 
                style={{ width: `${completedPercentage}%` }}
              ></div>
            </div>
            <span className={`${isMobile ? 'text-[10px]' : 'text-xs'} font-semibold text-gray-800 min-w-[26px] text-right`}>{completedPercentage}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
