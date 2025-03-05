
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useMonthlyRevenue } from "@/admin/hooks/useMonthlyRevenue";
import { formatCurrency } from "./formatters";
import { Skeleton } from "@/components/ui/skeleton";

export const RevenueOverviewCard = () => {
  const { data: monthlyRevenue, isLoading, error } = useMonthlyRevenue();

  const renderChart = () => {
    if (isLoading) {
      return (
        <div className="h-full w-full flex items-center justify-center">
          <Skeleton className="h-[300px] w-full" />
        </div>
      );
    }

    if (error || !monthlyRevenue) {
      return (
        <div className="h-full w-full flex items-center justify-center bg-muted/10 rounded-md border border-dashed border-muted">
          <p className="text-muted-foreground">Error loading revenue data</p>
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={monthlyRevenue}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis tickFormatter={(value) => formatCurrency(value)} />
          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
          <Bar 
            dataKey="revenue" 
            fill="#8884d8" 
            name="Revenue" 
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <Card className="col-span-4 border-indigo-100 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Revenue Overview</CardTitle>
        <CardDescription>Monthly revenue breakdown 📊</CardDescription>
      </CardHeader>
      <CardContent className="h-[350px]">
        {renderChart()}
      </CardContent>
    </Card>
  );
};
