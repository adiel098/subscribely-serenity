
import React from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChartDataPoint } from "@/group_owners/hooks/dashboard/types";

interface DashboardChartsProps {
  memberGrowthData: ChartDataPoint[];
  revenueData: ChartDataPoint[];
  timeRange: string;
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({
  memberGrowthData,
  revenueData,
  timeRange
}) => {
  return (
    <Card className="p-5 border-gray-200 shadow-sm rounded-lg">
      <Tabs defaultValue="members">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-800">Growth Analytics</h3>
          <TabsList className="bg-gray-100">
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="members" className="h-[300px] mt-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={memberGrowthData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="members" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-xs text-center text-gray-500 mt-2">Members growth over {timeRange}</p>
        </TabsContent>
        
        <TabsContent value="revenue" className="h-[300px] mt-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={revenueData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#82ca9d" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-xs text-center text-gray-500 mt-2">Revenue over {timeRange}</p>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
