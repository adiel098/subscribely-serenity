
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PaymentItem } from "@/admin/hooks/useAdminPayments";
import { StatusBadge } from "./StatusBadge";
import { PaymentMethodIcon } from "./PaymentMethodIcon";
import { Copy } from "lucide-react";
import { toast } from "sonner";

interface PaymentTableProps {
  payments: PaymentItem[];
  isFiltered: boolean;
  type: "platform" | "community";
}

export const PaymentTable = ({ payments, isFiltered, type }: PaymentTableProps) => {
  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id)
      .then(() => toast.success("Payment ID copied to clipboard"))
      .catch(() => toast.error("Failed to copy ID"));
  };

  return (
    <div className="rounded-md border border-indigo-100">
      <Table>
        <TableHeader className="bg-indigo-50">
          <TableRow>
            <TableHead>Payment ID</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>{type === "platform" ? "Plan" : "Community"}</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8">
                {isFiltered ? (
                  <p className="text-muted-foreground">No {type} payments found matching your search.</p>
                ) : (
                  <p className="text-muted-foreground">No {type} payments found.</p>
                )}
              </TableCell>
            </TableRow>
          ) : (
            payments.map((payment) => (
              <TableRow key={payment.id} className="hover:bg-indigo-50/30">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <span>{payment.id.substring(0, 8)}...</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleCopyId(payment.id)}
                      title="Copy full ID"
                    >
                      <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{payment.user}</p>
                    <p className="text-sm text-muted-foreground">
                      {type === "platform" ? payment.email : `@${payment.email}`}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="font-medium text-green-600">
                  {payment.amount}
                </TableCell>
                <TableCell>{payment.community}</TableCell>
                <TableCell>{payment.date}</TableCell>
                <TableCell className="flex items-center gap-1">
                  <PaymentMethodIcon method={payment.method} />
                  {payment.method?.replace('_', ' ') || 'Unknown'}
                </TableCell>
                <TableCell>
                  <StatusBadge status={payment.status} />
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" className="border-indigo-100">
                    Details
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
