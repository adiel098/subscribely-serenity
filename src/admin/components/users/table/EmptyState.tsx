
import { TableCell, TableRow } from "@/components/ui/table";

export const EmptyState = () => {
  return (
    <TableRow>
      <TableCell colSpan={7} className="h-24 text-center">
        No users found
      </TableCell>
    </TableRow>
  );
};
