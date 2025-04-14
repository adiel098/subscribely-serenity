import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { DollarSign } from "lucide-react";

interface RevenueChartCardProps {
  data: Array<{
    date: string;
    revenue: number;
  }>;
}

export const RevenueChartCard: React.FC<RevenueChartCardProps> = ({ data = [] }) => {
  // Ensure data is an array
  const safeData = Array.isArray(data) ? data : [];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-green-600" />
          <span>Revenue</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {safeData.length === 0 ? (
          <div className="flex justify-center items-center h-[250px] text-slate-500">
            No revenue data available yet
          </div>
        ) : (
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={safeData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
                />
                <Bar 
                  dataKey="revenue" 
                  fill="#10b981" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
