import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ActivityChartProps {
  data: { date: string; events: number; revenue: number }[];
}

export const ActivityChart = ({ data }: ActivityChartProps) => {
  return (
    <div className="bg-white rounded-md shadow-sm border">
      <h3 className="font-semibold text-lg p-4">Activity Chart</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 15, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="events" fill="#8884d8" name="Events" />
          <Bar dataKey="revenue" fill="#82ca9d" name="Revenue" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
