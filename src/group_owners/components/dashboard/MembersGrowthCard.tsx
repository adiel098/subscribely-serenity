import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";

interface MembersGrowthCardProps {
  data: any[] | null | undefined;
}

export const MembersGrowthCard = ({ data }: MembersGrowthCardProps) => {
  // Handle null, undefined or non-array data gracefully
  const safeData = Array.isArray(data) ? data : [];

  // If no data available, show info message
  if (safeData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Members Growth</CardTitle>
          <CardDescription>
            Growth of members over time
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <div className="text-center text-muted-foreground">
            <p>No member growth data available</p>
            <p className="text-sm mt-2">Data will appear as members join</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Members Growth</CardTitle>
        <CardDescription>
          Growth of members over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={safeData}
              margin={{
                top: 5,
                right: 10,
                left: 10,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`${value} members`, 'Count']}
                labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              />
              <Line
                type="monotone"
                dataKey="subscribers"
                strokeWidth={2}
                stroke="#4f46e5"
                activeDot={{
                  r: 6,
                  style: { fill: "#4f46e5", opacity: 0.25 },
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
