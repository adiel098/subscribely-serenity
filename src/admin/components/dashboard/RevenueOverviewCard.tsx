
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const RevenueOverviewCard = () => {
  return (
    <Card className="col-span-4 border-indigo-100 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Revenue Overview</CardTitle>
        <CardDescription>Monthly revenue breakdown 📊</CardDescription>
      </CardHeader>
      <CardContent className="h-[350px]">
        <div className="h-full w-full flex items-center justify-center bg-muted/10 rounded-md border border-dashed border-muted">
          <p className="text-muted-foreground">Chart will be displayed here</p>
        </div>
      </CardContent>
    </Card>
  );
};
