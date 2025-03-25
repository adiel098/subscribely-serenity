
import React from "react";
import { format } from "date-fns";
import { Check, X, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Purchase {
  id: string;
  date: string;
  amount: number;
  status: "completed" | "pending" | "failed";
  method: string;
}

interface MobileOptimizedPurchaseHistoryProps {
  purchases: Purchase[];
}

export const MobileOptimizedPurchaseHistory: React.FC<MobileOptimizedPurchaseHistoryProps> = ({ 
  purchases 
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <Check className="h-3 w-3 text-green-500" />;
      case "pending":
        return <ArrowRight className="h-3 w-3 text-yellow-500" />;
      case "failed":
        return <X className="h-3 w-3 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-[10px] h-4 px-1.5">Completed</Badge>;
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-[10px] h-4 px-1.5">Pending</Badge>;
      case "failed":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-[10px] h-4 px-1.5">Failed</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-medium text-gray-500 mb-1">Purchase History</h3>
      
      {purchases.length === 0 ? (
        <Card className="border border-gray-200">
          <CardContent className="flex flex-col items-center justify-center p-3 text-center">
            <p className="text-xs text-gray-500">No purchase history available</p>
          </CardContent>
        </Card>
      ) : (
        purchases.map((purchase) => (
          <Card key={purchase.id} className="border border-gray-200 overflow-hidden">
            <CardContent className="p-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-medium text-gray-800">${purchase.amount.toFixed(2)}</p>
                  <p className="text-[10px] text-gray-500">{format(new Date(purchase.date), "MMM d, yyyy")}</p>
                </div>
                <div className="flex flex-col items-end">
                  <div className="mb-1">{getStatusBadge(purchase.status)}</div>
                  <p className="text-[10px] text-gray-500">{purchase.method}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};
