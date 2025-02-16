
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface BroadcastStatsProps {
  broadcastId: string;
}

export const BroadcastStats = ({ broadcastId }: BroadcastStatsProps) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['broadcast-stats', broadcastId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('broadcast_messages')
        .select('total_recipients, sent_success, sent_failed')
        .eq('id', broadcastId)
        .single();

      if (error) throw error;
      return data;
    },
    refetchInterval: 5000, // Refresh every 5 seconds while showing stats
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid grid-cols-3 gap-4 mt-4">
      <Card>
        <CardHeader className="py-2">
          <CardTitle className="text-sm">Total Recipients</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{stats.total_recipients}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="py-2">
          <CardTitle className="text-sm text-green-600">Sent Successfully</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-green-600">{stats.sent_success}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="py-2">
          <CardTitle className="text-sm text-red-600">Failed</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-red-600">{stats.sent_failed}</p>
        </CardContent>
      </Card>
    </div>
  );
};
