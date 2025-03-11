
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from 'recharts';
import { ChartDataPoint } from "@/group_owners/hooks/dashboard/types";
import { format, parseISO } from "date-fns";

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
  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), "MMM dd");
    } catch (error) {
      return dateStr;
    }
  };

  const formatTooltipDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), "MMM dd, yyyy");
    } catch (error) {
      return dateStr;
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
          <p className="font-medium">{formatTooltipDate(label)}</p>
          <p className="text-[#8884d8]">
            {`${payload[0].name}: ${payload[0].value}`}
          </p>
        </div>
      );
    }
  
    return null;
  };

  return (
    <Card className="col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium text-gray-800">Community Growth</CardTitle>
      </CardHeader>
      <Tabs defaultValue="members">
        <div className="px-4 flex justify-between items-center">
          <TabsList className="h-9">
            <TabsTrigger value="members" className="text-xs px-3">Members</TabsTrigger>
            <TabsTrigger value="revenue" className="text-xs px-3">Revenue</TabsTrigger>
          </TabsList>
          <span className="text-xs text-gray-500">{timeRange}</span>
        </div>
        <CardContent className="pt-4">
          <TabsContent value="members" className="mt-0">
            <div className="h-[300px]">
              {memberGrowthData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={memberGrowthData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorMembers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDate} 
                      tick={{ fontSize: 12 }} 
                      axisLine={{ stroke: '#E5E7EB' }}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }} 
                      axisLine={false} 
                      tickLine={false}
                      tickCount={5}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <CartesianGrid vertical={false} stroke="#E5E7EB" />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#8884d8" 
                      fillOpacity={1} 
                      fill="url(#colorMembers)" 
                      name="New Members"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">No member data available for the selected period</p>
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="revenue" className="mt-0">
            <div className="h-[300px]">
              {revenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={revenueData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid vertical={false} stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDate} 
                      tick={{ fontSize: 12 }} 
                      axisLine={{ stroke: '#E5E7EB' }}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }} 
                      axisLine={false} 
                      tickLine={false}
                      tickCount={5}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="value" 
                      fill="#4CAF50" 
                      radius={[4, 4, 0, 0]} 
                      name="Revenue"
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">No revenue data available for the selected period</p>
                </div>
              )}
            </div>
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
};
