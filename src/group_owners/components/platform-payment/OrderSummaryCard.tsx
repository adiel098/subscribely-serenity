
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

interface OrderSummaryCardProps {
  planName: string;
  planInterval: string;
  planPrice: number;
}

export const OrderSummaryCard = ({ planName, planInterval, planPrice }: OrderSummaryCardProps) => {
  return (
    <Card className="mb-8 border-indigo-100 shadow-md overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 pb-3">
        <CardTitle className="flex items-center text-indigo-700 gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          Order Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-medium text-gray-800">{planName} Plan</p>
            <p className="text-sm text-muted-foreground">
              {planInterval.charAt(0).toUpperCase() + planInterval.slice(1)} billing
            </p>
          </div>
          <div className="text-xl font-bold text-indigo-700">${planPrice}</div>
        </div>
      </CardContent>
    </Card>
  );
};
