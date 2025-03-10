
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OrderSummaryCardProps {
  planName: string;
  planInterval: string;
  planPrice: number;
}

export const OrderSummaryCard = ({ planName, planInterval, planPrice }: OrderSummaryCardProps) => {
  return (
    <Card className="mb-8 border-indigo-100">
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <div>
            <p className="font-medium">{planName} Plan</p>
            <p className="text-sm text-muted-foreground">
              {planInterval.charAt(0).toUpperCase() + planInterval.slice(1)} billing
            </p>
          </div>
          <div className="text-xl font-bold">${planPrice}</div>
        </div>
      </CardContent>
    </Card>
  );
};
