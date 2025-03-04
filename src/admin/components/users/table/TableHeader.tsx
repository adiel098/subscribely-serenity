
import {
  TableHead,
  TableHeader as UITableHeader,
  TableRow,
} from "@/components/ui/table";

export const TableHeader = () => {
  return (
    <UITableHeader>
      <TableRow className="bg-muted/50">
        <TableHead className="w-[250px]">User</TableHead>
        <TableHead className="w-[100px]">Status</TableHead>
        <TableHead className="w-[130px]">Role</TableHead>
        <TableHead>Communities</TableHead>
        <TableHead>Subscriptions</TableHead>
        <TableHead>Joined</TableHead>
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </UITableHeader>
  );
};
