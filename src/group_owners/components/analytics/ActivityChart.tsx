
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

interface ChartData {
  date: string;
  events: number;
  revenue: number;
}

interface ActivityChartProps {
  data: ChartData[];
}

export const ActivityChart = ({ data }: ActivityChartProps) => {
  // Create custom tick formatter to shorten dates
  const formatXAxis = (tickItem: string) => {
    // Convert full date to MM/DD format
    const date = new Date(tickItem);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity and Revenue</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis 
                dataKey="date" 
                tickFormatter={formatXAxis}
                tick={{fontSize: 12, fill: '#6b7280'}}
              />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Bar yAxisId="left" dataKey="events" fill="#4f46e5" name="Events" />
              <Bar yAxisId="right" dataKey="revenue" fill="#22c55e" name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
