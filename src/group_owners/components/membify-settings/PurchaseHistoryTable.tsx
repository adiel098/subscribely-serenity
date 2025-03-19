
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/auth/contexts/AuthContext";

type Payment = {
  id: string;
  amount: number;
  payment_method: string | null;
  payment_status: string | null;
  plan_name: string;
  created_at: string;
};

export const PurchaseHistoryTable = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPayments();
    }
  }, [user]);

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('platform_payments')
        .select(`
          id, 
          amount, 
          payment_method,
          payment_status,
          created_at,
          platform_plans(name)
        `)
        .eq('owner_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error("Error fetching payments:", error);
      } else if (data) {
        const formattedPayments = data.map(item => {
          // Access platform_plans correctly as an object
          const planData = item.platform_plans as { name: string } | null;
          
          return {
            id: item.id,
            amount: item.amount,
            payment_method: item.payment_method,
            payment_status: item.payment_status,
            plan_name: planData?.name || 'Unknown Plan',
            created_at: item.created_at
          };
        });
        
        setPayments(formattedPayments);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string | null) => {
    if (!status) return null;
    
    switch(status.toLowerCase()) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatPaymentMethod = (method: string | null) => {
    if (!method) return 'Unknown';
    
    // Capitalize first letter of each word
    return method
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-20">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">No payment history found</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Plan</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Payment Method</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((payment) => (
          <TableRow key={payment.id}>
            <TableCell className="font-medium">
              {payment.created_at ? format(new Date(payment.created_at), "MMM d, yyyy") : "N/A"}
            </TableCell>
            <TableCell>{payment.plan_name}</TableCell>
            <TableCell>${payment.amount.toFixed(2)}</TableCell>
            <TableCell>{formatPaymentMethod(payment.payment_method)}</TableCell>
            <TableCell>{getStatusBadge(payment.payment_status)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
