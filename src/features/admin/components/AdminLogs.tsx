import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/features/admin/components/ui/table";
import { Badge } from "@/features/admin/components/ui/badge";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

interface SystemLog {
  id: number;
  event_type: string;
  details: string;
  created_at: string;
  user_id: string | null;
  metadata: Record<string, any> | null;
  profiles?: {
    full_name: string | null;
    email: string | null;
  } | null;
}

export const AdminLogs = () => {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['system-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_logs')
        .select(`
          *,
          profiles:profiles!system_logs_user_id_fkey (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching system logs:', error);
        throw error;
      }
      return data as SystemLog[];
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary/80" />
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Time</TableHead>
            <TableHead>Event Type</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!logs?.length ? (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
                No logs found
              </TableCell>
            </TableRow>
          ) : (
            logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="whitespace-nowrap">
                  {format(new Date(log.created_at), 'PP p')}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{log.event_type}</Badge>
                </TableCell>
                <TableCell>
                  {log.profiles?.full_name || log.profiles?.email || 'System'}
                </TableCell>
                <TableCell className="max-w-md truncate">
                  {log.details}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
