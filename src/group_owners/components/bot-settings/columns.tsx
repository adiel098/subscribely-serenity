
import { ColumnDef } from "@tanstack/react-table"
import { Plan } from "@/types/subscription"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"

export const columns = (onEdit: (plan: Plan) => void, onDelete: (id: string) => void): ColumnDef<Plan>[] => [
  {
    accessorKey: "name",
    header: "Plan Name"
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("price"))
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
      }).format(price)
      return formatted
    }
  },
  {
    accessorKey: "interval",
    header: "Billing Interval",
    cell: ({ row }) => {
      const interval = row.getValue("interval") as string
      return interval.charAt(0).toUpperCase() + interval.slice(1)
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const plan = row.original

      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(plan)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(plan.id)}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      )
    }
  }
]
