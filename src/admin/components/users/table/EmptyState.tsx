
import { TableCell, TableRow } from "@/components/ui/table";

interface EmptyStateProps {
  colSpan?: number;
}

export const EmptyState = ({ colSpan = 7 }: EmptyStateProps) => {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="h-24 text-center">
        No users found
      </TableCell>
    </TableRow>
  );
};
