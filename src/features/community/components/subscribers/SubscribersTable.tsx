import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, UserX } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
            <TableHead>Username</TableHead>
            <TableHead>Telegram ID</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscribers.map((subscriber) => (
            <TableRow key={subscriber.id}>
              <TableCell className="font-medium">{subscriber.telegram_username || 'No username'}</TableCell>
              <TableCell>{subscriber.telegram_user_id}</TableCell>
              <TableCell>{subscriber.plan?.name || 'No plan'}</TableCell>
              <TableCell>{subscriber.subscription_status ? 'Active' : 'Inactive'}</TableCell>
              <TableCell>{new Date(subscriber.joined_at).toLocaleDateString()}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(subscriber)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onRemove(subscriber)}>
                      <UserX className="mr-2 h-4 w-4" />
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
          {subscribers.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center">No subscribers found.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
