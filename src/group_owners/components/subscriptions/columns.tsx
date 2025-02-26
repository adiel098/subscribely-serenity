
import { ColumnDef } from "@tanstack/react-table";

interface SubscriptionPlan {
  name: string;
  price: number;
  interval: string;
  status: string;
}

export const columns: ColumnDef<SubscriptionPlan>[] = [
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

