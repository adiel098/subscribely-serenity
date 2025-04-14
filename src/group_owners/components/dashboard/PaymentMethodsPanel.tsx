import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface PaymentMethod {
  name: string;
  value: number;
  color: string;
}

interface PaymentMethodsPanelProps {
  paymentMethods: PaymentMethod[] | null;
  paymentDistribution: any[] | null;
}

export const PaymentMethodsPanel = ({ 
  paymentMethods, 
  paymentDistribution 
}: PaymentMethodsPanelProps) => {
  // Safety checks for data
  const safePaymentMethods = Array.isArray(paymentMethods) ? paymentMethods : [];
  const safePaymentDistribution = Array.isArray(paymentDistribution) ? paymentDistribution : [];
  
  // Check if there is any payment data
  const hasPaymentData = safePaymentMethods.length > 0 || safePaymentDistribution.length > 0;
  
  // If no data, display empty state
  if (!hasPaymentData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>Distribution of payment methods used</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-[250px] text-center">
          <p className="text-muted-foreground mb-2">No payment data available</p>
          <p className="text-sm text-muted-foreground">
            Payment distribution will be shown once users make payments
          </p>
        </CardContent>
      </Card>
    );
  }
  
  // Custom renderer for pie chart labels
  const renderCustomizedLabel = ({ 
    cx, 
    cy, 
    midAngle, 
    innerRadius, 
    outerRadius, 
    percent
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
    
    return percent > 0.05 ? (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor="middle" 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Methods</CardTitle>
        <CardDescription>Distribution of payment methods used</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={safePaymentMethods}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {safePaymentMethods.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Legend layout="horizontal" verticalAlign="bottom" align="center" />
              <Tooltip 
                formatter={(value, name) => [`${value} subscribers`, name]}
                itemStyle={{ color: '#000' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
