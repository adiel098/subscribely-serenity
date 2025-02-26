
import { ColumnDef } from "@tanstack/react-table";

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: "name",
    header: "Name",
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
    accessorKey: "is_active",
    header: "Status",
  },
];
