import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/features/community/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

interface BroadcastStatsProps {
  broadcastId: string;
}

export const BroadcastStats = ({ broadcastId }: BroadcastStatsProps) => {
  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ['broadcast-stats', broadcastId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('broadcast_messages')
        .select('total_recipients, sent_success, sent_failed, status')
        .eq('id', broadcastId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    // Subscribe to changes in the broadcast_messages table
    const channel = supabase
      .channel('broadcast-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'broadcast_messages',
          filter: `id=eq.${broadcastId}`,
        },
        () => {
          console.log('Received broadcast update, refetching stats...');
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [broadcastId, refetch]);

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!stats) return null;

  const isInProgress = stats.status === 'pending';

  return (
    <div className="grid grid-cols-3 gap-4 mt-4">
      <Card>
        <CardHeader className="py-2">
          <CardTitle className="text-sm">Total Recipients</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{stats.total_recipients}</p>
          {isInProgress && (
            <p className="text-sm text-muted-foreground">Sending in progress...</p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="py-2">
          <CardTitle className="text-sm text-green-600">Sent Successfully</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-green-600">{stats.sent_success}</p>
          {isInProgress && (
            <div className="mt-1">
              <Loader2 className="h-4 w-4 animate-spin text-green-600" />
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="py-2">
          <CardTitle className="text-sm text-red-600">Failed</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-red-600">{stats.sent_failed}</p>
          {isInProgress && (
            <div className="mt-1">
              <Loader2 className="h-4 w-4 animate-spin text-red-600" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
