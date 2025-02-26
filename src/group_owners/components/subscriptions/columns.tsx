
import { ColumnDef } from "@tanstack/react-table";

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: "name",
    header: "Plan Name",
  },
  {
    accessorKey: "price",
    header: "Price",
  },
  {
    accessorKey: "interval",
    header: "Interval",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
];

