import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";

interface MembersGrowthCardProps {
  data: Array<{
    date: string;
    subscribers: number;
  }>;
}

export const MembersGrowthCard: React.FC<MembersGrowthCardProps> = ({ data = [] }) => {
  // Ensure data is an array
  const safeData = Array.isArray(data) ? data : [];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <span>Member Growth</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {safeData.length === 0 ? (
          <div className="flex justify-center items-center h-[250px] text-slate-500">
            No member growth data available yet
          </div>
        ) : (
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
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
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="subscribers"
                  stroke="#4f46e5"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
