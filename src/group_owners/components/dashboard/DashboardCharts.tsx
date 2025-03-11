
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
  Legend
} from "recharts";

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
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      <Card className="shadow-sm hover:shadow-md transition-shadow border border-gray-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-gray-800">Member Growth</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart 
                data={memberGrowthData} 
                margin={{ top: 5, right: 5, bottom: 25, left: 5 }}
              >
                <defs>
                  <linearGradient id="memberGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" />
                <XAxis 
                  dataKey="date" 
                  angle={-45} 
                  textAnchor="end" 
                  height={60} 
                  tick={{fontSize: 12}}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [`${value} members`, 'Members']}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Area 
                  type="monotone" 
                  dataKey="members" 
                  stroke="#818cf8" 
                  fillOpacity={1} 
                  fill="url(#memberGradient)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm hover:shadow-md transition-shadow border border-gray-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-gray-800">Revenue Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart 
                data={revenueData} 
                margin={{ top: 5, right: 5, bottom: 25, left: 5 }}
              >
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" />
                <XAxis 
                  dataKey="date" 
                  angle={-45} 
                  textAnchor="end" 
                  height={60}
                  tick={{fontSize: 12}}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10b981" 
                  fillOpacity={1} 
                  fill="url(#revenueGradient)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm hover:shadow-md transition-shadow border border-gray-100 lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-gray-800">Daily Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={dailyStats} 
                margin={{ top: 5, right: 5, bottom: 25, left: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" />
                <XAxis 
                  dataKey="date" 
                  angle={-45} 
                  textAnchor="end" 
                  height={60}
                  tick={{fontSize: 12}}
                />
                <YAxis yAxisId="left" orientation="left" stroke="#818cf8" />
                <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
                <Tooltip
                  formatter={(value: number, name: string) => {
                    if (name === 'subscriptions') return [`${value} subs`, 'New Subscriptions'];
                    return [`$${value.toFixed(2)}`, 'Revenue'];
                  }}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Legend 
                  wrapperStyle={{ 
                    paddingTop: 10,
                    fontSize: 12
                  }}
                  formatter={(value) => {
                    if (value === 'subscriptions') return 'New Subscriptions';
                    return 'Revenue';
                  }}
                />
                <Bar 
                  yAxisId="left" 
                  dataKey="subscriptions" 
                  fill="#818cf8" 
                  radius={[4, 4, 0, 0]} 
                  name="subscriptions"
                />
                <Bar 
                  yAxisId="right" 
                  dataKey="revenue" 
                  fill="#10b981" 
                  radius={[4, 4, 0, 0]} 
                  name="revenue"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
