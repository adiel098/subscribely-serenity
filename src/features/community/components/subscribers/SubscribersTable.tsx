import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSubscribers } from "@/hooks/community/useSubscribers";
import { EditSubscriberDialog } from "@/features/community/components/subscribers/EditSubscriberDialog";

interface SubscribersTableProps {
  subscribers: any[];
  onEdit: (subscriber: any) => void;
  onRemove: (subscriber: any) => void;
}

export const SubscribersTable = ({ subscribers, onEdit, onRemove }: SubscribersTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Telegram ID</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscribers.map((subscriber) => (
            <TableRow key={subscriber.id}>
              <TableCell className="font-medium">{subscriber.telegram_user_id}</TableCell>
              <TableCell>{subscriber.telegram_username || "N/A"}</TableCell>
              <TableCell>{subscriber.plan?.name || "N/A"}</TableCell>
              <TableCell>{subscriber.subscription_status ? "Active" : "Inactive"}</TableCell>
              <TableCell>{new Date(subscriber.joined_at).toLocaleDateString()}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" onClick={() => onEdit(subscriber)}>
                  Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onRemove(subscriber)}>
                  Remove
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {subscribers.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                No subscribers found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
