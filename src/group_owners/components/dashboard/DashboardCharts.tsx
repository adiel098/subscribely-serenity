
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
          <p className={payload[0].name === "Revenue" ? "text-green-600" : "text-[#8B5CF6]"}>
            {`${payload[0].name}: ${payload[0].value}`}
          </p>
        </div>
      );
    }
  
    return null;
  };

  return (
    <Card className="w-full md:w-[45%] lg:w-[45%]">
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
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.05}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDate} 
                      tick={{ fontSize: 12 }} 
                      axisLine={false}
                      tickLine={false}
                      stroke="#E5E7EB"
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }} 
                      axisLine={false} 
                      tickLine={false}
                      strokeWidth={0}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <CartesianGrid vertical={false} stroke="#E5E7EB" opacity={0.3} />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#8B5CF6" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorMembers)" 
                      name="Members"
                      dot={{ fill: "#8B5CF6", r: 4 }}
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
                  <AreaChart
                    data={revenueData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4ADE80" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4ADE80" stopOpacity={0.05}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="#E5E7EB" opacity={0.3} />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDate} 
                      tick={{ fontSize: 12 }} 
                      axisLine={false}
                      tickLine={false}
                      stroke="#E5E7EB"
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }} 
                      axisLine={false} 
                      tickLine={false}
                      strokeWidth={0}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone"
                      dataKey="value" 
                      stroke="#4ADE80"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorRevenue)" 
                      name="Revenue"
                      dot={{ fill: "#4ADE80", r: 4 }}
                    />
                  </AreaChart>
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
