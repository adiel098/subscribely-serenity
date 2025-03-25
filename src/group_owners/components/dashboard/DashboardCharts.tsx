
import React from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChartDataPoint } from "@/group_owners/hooks/dashboard/types";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  
  return (
    <Card className={`${isMobile ? 'p-3' : 'p-5'} border-gray-200 shadow-sm rounded-lg`}>
      <Tabs defaultValue="members">
        <div className="flex items-center justify-between mb-4">
          <h3 className={`${isMobile ? 'text-sm' : 'text-lg'} font-medium text-gray-800`}>Growth Analytics</h3>
          <TabsList className="bg-gray-100">
            <TabsTrigger value="members" className={isMobile ? 'text-xs py-1 px-2 h-7' : ''}>Members</TabsTrigger>
            <TabsTrigger value="revenue" className={isMobile ? 'text-xs py-1 px-2 h-7' : ''}>Revenue</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="members" className={`${isMobile ? 'h-[200px]' : 'h-[300px]'} mt-0`}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={memberGrowthData}
              margin={isMobile ? { top: 5, right: 10, left: -15, bottom: 5 } : { top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: isMobile ? 10 : 12 }} />
              <YAxis tick={{ fontSize: isMobile ? 10 : 12 }} />
              <Tooltip contentStyle={isMobile ? { fontSize: '10px', padding: '5px' } : undefined} />
              <Line type="monotone" dataKey="members" stroke="#8884d8" activeDot={{ r: isMobile ? 5 : 8 }} strokeWidth={isMobile ? 1.5 : 2} />
            </LineChart>
          </ResponsiveContainer>
          <p className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-center text-gray-500 mt-1`}>Members growth over {timeRange}</p>
        </TabsContent>
        
        <TabsContent value="revenue" className={`${isMobile ? 'h-[200px]' : 'h-[300px]'} mt-0`}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={revenueData}
              margin={isMobile ? { top: 5, right: 10, left: -15, bottom: 5 } : { top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: isMobile ? 10 : 12 }} />
              <YAxis tick={{ fontSize: isMobile ? 10 : 12 }} />
              <Tooltip contentStyle={isMobile ? { fontSize: '10px', padding: '5px' } : undefined} />
              <Line type="monotone" dataKey="revenue" stroke="#82ca9d" activeDot={{ r: isMobile ? 5 : 8 }} strokeWidth={isMobile ? 1.5 : 2} />
            </LineChart>
          </ResponsiveContainer>
          <p className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-center text-gray-500 mt-1`}>Revenue over {timeRange}</p>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
