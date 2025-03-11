
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  Line,
  LineChart,
} from "recharts";
import { TrendingUp, BarChart3 } from "lucide-react";

interface ChartData {
  date: string;
  members: number;
}

interface RevenueData {
  date: string;
  revenue: number;
}

interface DailyStats {
  date: string;
  subscriptions: number;
  revenue: number;
}

interface DashboardChartsProps {
  memberGrowthData: ChartData[];
  revenueData: RevenueData[];
  dailyStats: DailyStats[];
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({
  memberGrowthData,
  revenueData,
  dailyStats
}) => {
  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-md rounded-md border border-gray-200">
          <p className="text-sm font-semibold text-gray-800 mb-1">{`Date: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} className="text-sm" style={{ color: entry.color }}>
              {entry.name === 'members' && `Members: ${entry.value}`}
              {entry.name === 'revenue' && `Revenue: $${entry.value.toFixed(2)}`}
              {entry.name === 'subscriptions' && `New Subscribers: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Create custom tick formatter to shorten dates
  const formatXAxis = (tickItem: string) => {
    // Convert full date to MM/DD format
    const date = new Date(tickItem);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-base font-medium text-gray-800 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-indigo-500" />
            Member Growth
          </h3>
        </div>
        <CardContent className="p-4">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={memberGrowthData} 
                margin={{ top: 15, right: 15, bottom: 25, left: 15 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatXAxis}
                  tick={{fontSize: 12, fill: '#6b7280'}}
                  stroke="#e5e7eb"
                />
                <YAxis tick={{fontSize: 12, fill: '#6b7280'}} stroke="#e5e7eb" />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="members" 
                  name="members"
                  stroke="#4f46e5" 
                  strokeWidth={2}
                  dot={{ stroke: '#4f46e5', strokeWidth: 2, r: 4, fill: 'white' }}
                  activeDot={{ r: 6, stroke: '#4f46e5', strokeWidth: 2, fill: '#4f46e5' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-base font-medium text-gray-800 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            Revenue Trends
          </h3>
        </div>
        <CardContent className="p-4">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart 
                data={revenueData} 
                margin={{ top: 15, right: 15, bottom: 25, left: 15 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatXAxis}
                  tick={{fontSize: 12, fill: '#6b7280'}}
                  stroke="#e5e7eb"
                />
                <YAxis 
                  tick={{fontSize: 12, fill: '#6b7280'}} 
                  stroke="#e5e7eb" 
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  name="revenue"
                  fill="#dcfce7" 
                  stroke="#10b981"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden lg:col-span-2">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-base font-medium text-gray-800 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-blue-500" />
            Daily Activity Analysis
          </h3>
        </div>
        <CardContent className="p-4">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={dailyStats} 
                margin={{ top: 15, right: 15, bottom: 25, left: 15 }}
                barGap={8}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatXAxis}
                  tick={{fontSize: 12, fill: '#6b7280'}}
                  stroke="#e5e7eb"
                />
                <YAxis 
                  yAxisId="left" 
                  orientation="left" 
                  tick={{fontSize: 12, fill: '#6b7280'}} 
                  stroke="#e5e7eb" 
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  tick={{fontSize: 12, fill: '#6b7280'}} 
                  stroke="#e5e7eb" 
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ paddingTop: 15, fontSize: 12 }}
                  iconType="circle"
                  iconSize={8}
                />
                <Bar 
                  yAxisId="left" 
                  dataKey="subscriptions" 
                  name="New Subscribers"
                  fill="#818cf8" 
                  radius={[4, 4, 0, 0]} 
                  barSize={30}
                />
                <Bar 
                  yAxisId="right" 
                  dataKey="revenue" 
                  name="Revenue"
                  fill="#34d399" 
                  radius={[4, 4, 0, 0]} 
                  barSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
