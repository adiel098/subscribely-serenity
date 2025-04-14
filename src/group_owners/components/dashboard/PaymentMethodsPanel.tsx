import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { CreditCard } from "lucide-react";

interface PaymentMethodsPanelProps {
  paymentMethods: Array<{
    name: string;
    count: number;
  }>;
  paymentDistribution: Array<{
    name: string;
    value: number;
  }>;
}

export const PaymentMethodsPanel: React.FC<PaymentMethodsPanelProps> = ({
  paymentMethods = [],
  paymentDistribution = []
}) => {
  // Ensure data is array
  const safePaymentMethods = Array.isArray(paymentMethods) ? paymentMethods : [];
  const safePaymentDistribution = Array.isArray(paymentDistribution) ? paymentDistribution : [];
  
  const hasData = safePaymentDistribution.length > 0;

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-purple-600" />
          <span>Payment Methods</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex justify-center items-center h-[250px] text-slate-500">
            No payment method data available yet
          </div>
        ) : (
          <div className="space-y-6">
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={safePaymentDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {safePaymentDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4">
              <ul className="space-y-2">
                {safePaymentMethods.map((method, index) => (
                  <li key={method.name} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      <span>{method.name}</span>
                    </div>
                    <span className="font-medium">{method.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
