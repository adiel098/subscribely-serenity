
import React from "react";
import { Card } from "@/components/ui/card";
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  CreditCard
} from "lucide-react";
import { PaymentStatistics } from "@/group_owners/hooks/dashboard/types";

interface PaymentStatusProps {
  paymentStats: PaymentStatistics;
}

export const PaymentStatus: React.FC<PaymentStatusProps> = ({
  paymentStats
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="p-5 bg-white border-l-4 border-l-emerald-500 border-t border-r border-b border-gray-200 shadow-sm rounded-lg md:col-span-1">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-600">Completed Payments</h3>
            <CheckCircle className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{paymentStats.completed}</p>
          <div className="mt-auto pt-2 text-xs text-gray-500 font-medium">
            <span>Successfully processed</span>
          </div>
        </div>
      </Card>

      <Card className="p-5 bg-white border-l-4 border-l-yellow-500 border-t border-r border-b border-gray-200 shadow-sm rounded-lg md:col-span-1">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-600">Pending Payments</h3>
            <Clock className="h-5 w-5 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{paymentStats.pending}</p>
          <div className="mt-auto pt-2 text-xs text-gray-500 font-medium">
            <span>Awaiting confirmation</span>
          </div>
        </div>
      </Card>

      <Card className="p-5 bg-white border-l-4 border-l-red-500 border-t border-r border-b border-gray-200 shadow-sm rounded-lg md:col-span-1">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-600">Failed Payments</h3>
            <XCircle className="h-5 w-5 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{paymentStats.failed}</p>
          <div className="mt-auto pt-2 text-xs text-gray-500 font-medium">
            <span>Require attention</span>
          </div>
        </div>
      </Card>

      <Card className="p-5 bg-white border-l-4 border-l-slate-500 border-t border-r border-b border-gray-200 shadow-sm rounded-lg md:col-span-1">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-600">Total Payments</h3>
            <CreditCard className="h-5 w-5 text-slate-500" />
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {paymentStats.completed + paymentStats.pending + paymentStats.failed}
          </p>
          <div className="mt-auto pt-2 text-xs text-gray-500 font-medium">
            <span>All transaction records</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
