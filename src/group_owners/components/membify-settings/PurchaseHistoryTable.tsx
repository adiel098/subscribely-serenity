
import React from "react";
import { format } from "date-fns";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/auth/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface PurchaseHistoryItem {
  id: string;
  created_at: string;
  amount: number;
  payment_method: string;
  payment_status: string;
  plan: {
    name: string;
    interval: string;
  } | null;
}

export function PurchaseHistoryTable() {
  const [purchases, setPurchases] = React.useState<PurchaseHistoryItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  React.useEffect(() => {
    const fetchPurchaseHistory = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('platform_payments')
          .select(`
            *,
            plan:platform_plans(name, interval)
          `)
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setPurchases(data || []);
      } catch (error) {
        console.error('Error fetching purchase history:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load purchase history."
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPurchaseHistory();
  }, [user, toast]);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-500 hover:bg-red-600">Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDatetime = (datetimeStr: string) => {
    try {
      return format(new Date(datetimeStr), 'dd MMM yyyy, HH:mm');
    } catch (e) {
      return datetimeStr || 'N/A';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
        <span className="ml-2">Loading purchase history...</span>
      </div>
    );
  }

  if (purchases.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg bg-muted/20">
        <h3 className="font-medium text-gray-700 mb-1">No purchases yet</h3>
        <p className="text-sm text-gray-500">Your purchase history will appear here</p>
      </div>
    );
  }

  return (
    <Table>
      <TableCaption>Your purchase history</TableCaption>
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
        {purchases.map((purchase) => (
          <TableRow key={purchase.id}>
            <TableCell>{formatDatetime(purchase.created_at)}</TableCell>
            <TableCell>{purchase.plan?.name || 'Unknown Plan'}</TableCell>
            <TableCell>${purchase.amount.toFixed(2)}</TableCell>
            <TableCell className="capitalize">{purchase.payment_method?.replace('_', ' ') || 'N/A'}</TableCell>
            <TableCell>{getStatusBadge(purchase.payment_status)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
