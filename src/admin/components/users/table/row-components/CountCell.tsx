
import React, { ReactNode } from "react";
import { TableCell } from "@/components/ui/table";

interface CountCellProps {
  count: number;
  icon: ReactNode;
}

export const CountCell = ({ count, icon }: CountCellProps) => {
  return (
    <TableCell>
      <div className="flex justify-center items-center gap-1">
        {icon}
        <span>{count}</span>
      </div>
    </TableCell>
  );
};
