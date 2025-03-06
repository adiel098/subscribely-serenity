
import React from "react";
import { TableCell } from "@/components/ui/table";
import { UserStatusBadge } from "../../UserStatusBadge";

interface StatusCellProps {
  status: 'active' | 'inactive' | 'suspended';
}

export const StatusCell = ({ status }: StatusCellProps) => {
  return (
    <TableCell>
      <div className="flex justify-center">
        <UserStatusBadge status={status} size="sm" />
      </div>
    </TableCell>
  );
};
