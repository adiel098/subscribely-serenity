
import React from "react";
import { TableCell } from "@/components/ui/table";
import { Calendar } from "lucide-react";

interface JoinedCellProps {
  createdAt: string | null;
}

export const JoinedCell = ({ createdAt }: JoinedCellProps) => {
  return (
    <TableCell>
      <div className="flex justify-center items-center text-xs">
        <Calendar className="mr-1 h-3 w-3" />
        {createdAt ? new Date(createdAt).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }) : 'Unknown'}
      </div>
    </TableCell>
  );
};
