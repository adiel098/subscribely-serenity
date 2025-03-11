
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  CreditCard, 
  CheckCircle, 
  Clock, 
  XCircle,
  DollarSign,
  Receipt,
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
    <div className="w-full md:w-[45%] lg:w-[45%]">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium text-gray-800 flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-green-500" />
          Payment Analytics
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-base font-medium text-gray-800 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-indigo-500" />
                Transaction Status
              </h3>
            </div>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm text-gray-600">Completed</span>
                  </div>
                  <span className="font-semibold text-gray-800">{paymentStats.completed}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-gray-600">Pending</span>
                  </div>
                  <span className="font-semibold text-gray-800">{paymentStats.pending}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-gray-600">Failed</span>
                  </div>
                  <span className="font-semibold text-gray-800">{paymentStats.failed}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-base font-medium text-gray-800 flex items-center gap-2">
                <Receipt className="h-4 w-4 text-purple-500" />
                Payment Insights
              </h3>
            </div>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="p-3 bg-white border border-gray-200 rounded-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Total Transactions</p>
                      <p className="text-xl font-bold text-gray-800">{totalPayments}</p>
                    </div>
                    <Wallet className="h-5 w-5 text-gray-400" />
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Success Rate</p>
                  <div className="flex items-center gap-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-emerald-500 h-2 rounded-full" 
                        style={{ width: `${completedPercentage}%` }}
                      ></div>
                    </div>
                    <span className="text-base font-semibold text-gray-800 min-w-[45px] text-right">{completedPercentage}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </div>
  );
};
