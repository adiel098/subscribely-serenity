
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subMonths } from "date-fns";

export interface MonthlyRevenue {
  month: string;
  revenue: number;
}

export const useMonthlyRevenue = () => {
  return useQuery({
    queryKey: ["monthly-revenue"],
    queryFn: async (): Promise<MonthlyRevenue[]> => {
      const sixMonthsAgo = subMonths(new Date(), 6);
      
      // Format date for SQL query
      const formattedDate = sixMonthsAgo.toISOString().split('T')[0];

      // Get platform payments data for the last 6 months
      const { data: platformPaymentsData, error: platformPaymentsError } = await supabase
        .from('platform_payments')
        .select('amount, created_at')
        .gte('created_at', formattedDate)
        .in('payment_status', ['successful', 'completed']);
      
      if (platformPaymentsError) {
        console.error("Error fetching platform payments:", platformPaymentsError);
        throw platformPaymentsError;
      }

      // Process the data to group by month
      const monthlyData: Record<string, number> = {};

      // Initialize with past 6 months (including current)
      for (let i = 5; i >= 0; i--) {
        const monthDate = subMonths(new Date(), i);
        const monthKey = format(monthDate, 'MMM yyyy');
        monthlyData[monthKey] = 0;
      }

      // Aggregate the payments by month
      platformPaymentsData.forEach(payment => {
        const paymentDate = new Date(payment.created_at);
        const monthKey = format(paymentDate, 'MMM yyyy');
        
        if (monthlyData[monthKey] !== undefined) {
          monthlyData[monthKey] += Number(payment.amount || 0);
        }
      });

      // Convert to array format for Recharts
      const result: MonthlyRevenue[] = Object.entries(monthlyData).map(([month, revenue]) => ({
        month,
        revenue
      }));

      return result;
    },
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
    staleTime: 9 * 60 * 1000, // Consider data stale after 9 minutes
  });
};
