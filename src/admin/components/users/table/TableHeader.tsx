
import {
  TableHead,
  TableHeader as UITableHeader,
  TableRow,
} from "@/components/ui/table";

export const TableHeader = () => {
  return (
    <>
      <TableHead className="w-[250px] text-left">User</TableHead>
      <TableHead className="w-[110px] text-center">Status</TableHead>
      <TableHead className="w-[140px] text-center">Role</TableHead>
      <TableHead className="text-center">Communities</TableHead>
      <TableHead className="text-center">Subscriptions</TableHead>
      <TableHead className="text-center">Joined</TableHead>
      <TableHead className="text-right w-[150px]">Actions</TableHead>
    </>
  );
};
