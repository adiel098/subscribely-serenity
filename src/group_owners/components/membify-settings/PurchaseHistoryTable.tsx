
import React from "react";
import { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { CreditCard } from "lucide-react";

export const PurchaseHistoryTable = () => {
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
                  <tr className="text-sm hover:bg-gray-50">
                    <td className="px-3 py-2.5">May 12, 2023</td>
                    <td className="px-3 py-2.5">Pro Plan</td>
                    <td className="px-3 py-2.5">$49.99</td>
                    <td className="px-3 py-2.5">
                      <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
                        Paid
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </CardContent>
    </>
  );
};
