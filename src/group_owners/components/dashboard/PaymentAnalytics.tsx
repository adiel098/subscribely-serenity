
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

interface PaymentAnalyticsProps {
  paymentStats: PaymentStatistics;
}

export const PaymentAnalytics: React.FC<PaymentAnalyticsProps> = ({
  paymentStats
}) => {
  const totalPayments = paymentStats.completed + paymentStats.pending + paymentStats.failed;
  const completedPercentage = totalPayments > 0 
    ? Math.round((paymentStats.completed / totalPayments) * 100) 
    : 0;
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-1">
        <CardTitle className="text-sm font-medium text-gray-800 flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-green-500" />
          Payment Analytics
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0 pb-4 space-y-3">
        {/* Transaction Status Section - More compact */}
        <div className="grid grid-cols-3 gap-1">
          <div className="flex flex-col items-center p-2 bg-gray-50 rounded-md">
            <div className="flex items-center gap-1 mb-1">
              <CheckCircle className="w-3 h-3 text-emerald-500" />
              <span className="text-xs text-gray-600">Done</span>
            </div>
            <span className="font-semibold text-sm text-gray-800">{paymentStats.completed}</span>
          </div>
          <div className="flex flex-col items-center p-2 bg-gray-50 rounded-md">
            <div className="flex items-center gap-1 mb-1">
              <Clock className="w-3 h-3 text-yellow-500" />
              <span className="text-xs text-gray-600">Pending</span>
            </div>
            <span className="font-semibold text-sm text-gray-800">{paymentStats.pending}</span>
          </div>
          <div className="flex flex-col items-center p-2 bg-gray-50 rounded-md">
            <div className="flex items-center gap-1 mb-1">
              <XCircle className="w-3 h-3 text-red-500" />
              <span className="text-xs text-gray-600">Failed</span>
            </div>
            <span className="font-semibold text-sm text-gray-800">{paymentStats.failed}</span>
          </div>
        </div>

        {/* Transaction Total */}
        <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
          <div>
            <p className="text-xs text-gray-500">Total Transactions</p>
            <p className="text-sm font-bold text-gray-800">{totalPayments}</p>
          </div>
          <Wallet className="h-4 w-4 text-gray-400" />
        </div>

        {/* Success Rate */}
        <div>
          <p className="text-xs text-gray-500 mb-1">Success Rate</p>
          <div className="flex items-center gap-2">
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-emerald-500 h-1.5 rounded-full" 
                style={{ width: `${completedPercentage}%` }}
              ></div>
            </div>
            <span className="text-xs font-semibold text-gray-800 min-w-[32px] text-right">{completedPercentage}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
