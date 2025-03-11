
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  ComposedChart
} from "recharts";
import { TrendingUp, BarChart3, Activity } from "lucide-react";

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
        <div className="custom-tooltip bg-white p-4 shadow-lg rounded-lg border border-gray-100">
          <p className="text-sm font-semibold text-gray-800">{`Date: ${label}`}</p>
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      <Card className="rounded-xl border-none overflow-hidden shadow-md">
        <CardHeader className="pb-2 border-b border-gray-100 bg-gradient-to-r from-white to-indigo-50">
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-indigo-600" />
            Member Growth
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-4">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={memberGrowthData} 
                margin={{ top: 15, right: 20, bottom: 25, left: 15 }}
              >
                <defs>
                  <linearGradient id="memberGradientLine" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.5}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" />
                <XAxis 
                  dataKey="date" 
                  angle={-45} 
                  textAnchor="end" 
                  height={60} 
                  tick={{fontSize: 12, fill: '#6b7280'}}
                  stroke="#e5e7eb"
                />
                <YAxis tick={{fontSize: 12, fill: '#6b7280'}} stroke="#e5e7eb" />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="members" 
                  name="members"
                  stroke="url(#memberGradientLine)" 
                  strokeWidth={3}
                  dot={{ stroke: '#4f46e5', strokeWidth: 2, r: 4, fill: 'white' }}
                  activeDot={{ r: 6, stroke: '#4f46e5', strokeWidth: 2, fill: '#4f46e5' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl border-none overflow-hidden shadow-md">
        <CardHeader className="pb-2 border-b border-gray-100 bg-gradient-to-r from-white to-green-50">
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Revenue Trends
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-4">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart 
                data={revenueData} 
                margin={{ top: 15, right: 20, bottom: 25, left: 15 }}
              >
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" />
                <XAxis 
                  dataKey="date" 
                  angle={-45} 
                  textAnchor="end" 
                  height={60}
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
                  fill="url(#revenueGradient)" 
                  stroke="#10b981"
                  strokeWidth={3}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#047857" 
                  dot={{ stroke: '#047857', strokeWidth: 2, r: 4, fill: 'white' }}
                  activeDot={{ r: 6, stroke: '#047857', strokeWidth: 2, fill: '#047857' }}
                  strokeWidth={2}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl border-none overflow-hidden shadow-md lg:col-span-2">
        <CardHeader className="pb-2 border-b border-gray-100 bg-gradient-to-r from-white to-blue-50">
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            Daily Activity Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-4">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={dailyStats} 
                margin={{ top: 15, right: 20, bottom: 25, left: 15 }}
                barGap={8}
              >
                <defs>
                  <linearGradient id="subscriptionsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.4}/>
                  </linearGradient>
                  <linearGradient id="revenueBarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.4}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  angle={-45} 
                  textAnchor="end" 
                  height={60}
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
                  fill="url(#subscriptionsGradient)" 
                  radius={[4, 4, 0, 0]} 
                  barSize={30}
                />
                <Bar 
                  yAxisId="right" 
                  dataKey="revenue" 
                  name="Revenue"
                  fill="url(#revenueBarGradient)" 
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
