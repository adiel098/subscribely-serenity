
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PlatformPlan {
  id: string;
  name: string;
  price: number;
  interval: string;
}

interface OrderSummaryCardProps {
  selectedPlan: PlatformPlan;
}

export const OrderSummaryCard = ({ selectedPlan }: OrderSummaryCardProps) => {
  return (
    <Card className="mb-8 border-indigo-100">
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <div>
            <p className="font-medium">{selectedPlan.name} Plan</p>
            <p className="text-sm text-muted-foreground">
              {selectedPlan.interval.charAt(0).toUpperCase() + selectedPlan.interval.slice(1)} billing
            </p>
          </div>
          <div className="text-xl font-bold">${selectedPlan.price}</div>
        </div>
      </CardContent>
    </Card>
  );
};
