
import React from "react";
import { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { CreditCard, Loader2 } from "lucide-react";
import { usePlatformPaymentHistory } from "../../hooks/usePlatformPaymentHistory";
import { Badge } from "@/components/ui/badge";

export const PurchaseHistoryTable = () => {
  const { payments, isLoading, error } = usePlatformPaymentHistory();

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'succeeded':
      case 'paid':
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">
            Paid
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200">
            Pending
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200">
            Failed
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100 border-gray-200">
            {status}
          </Badge>
        );
    }
  };

  return (
    <>
      <CardHeader>
        <CardTitle>Billing Information</CardTitle>
        <CardDescription>View your billing history and payment information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6">
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <h3 className="font-medium text-blue-700 mb-2 flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Purchase History
            </h3>
            <div className="mt-3 bg-white rounded-lg border overflow-hidden">
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              ) : error ? (
                <div className="text-red-500 p-4 text-center">
                  Error loading payment history
                </div>
              ) : payments.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No payment history found
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 text-xs text-gray-500">
                    <tr>
                      <th className="px-3 py-2 text-left">Date</th>
                      <th className="px-3 py-2 text-left">Plan</th>
                      <th className="px-3 py-2 text-left">Amount</th>
                      <th className="px-3 py-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {payments.map((payment) => (
                      <tr key={payment.id} className="text-sm hover:bg-gray-50">
                        <td className="px-3 py-2.5">{payment.date}</td>
                        <td className="px-3 py-2.5">{payment.planName}</td>
                        <td className="px-3 py-2.5">{payment.formattedAmount}</td>
                        <td className="px-3 py-2.5">
                          {getStatusBadge(payment.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </>
  );
};
