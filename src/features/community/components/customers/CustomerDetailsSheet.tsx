
import { format } from "date-fns";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Customer } from "@/hooks/community/useCustomers";

interface CustomerDetailsSheetProps {
  customer: Customer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CustomerDetailsSheet = ({ customer, open, onOpenChange }: CustomerDetailsSheetProps) => {
  if (!customer) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src={customer.avatar_url || ''} />
              <AvatarFallback>{customer.telegram_username?.[0] || '?'}</AvatarFallback>
            </Avatar>
            <div>
              <SheetTitle>{customer.telegram_username || 'No Username'}</SheetTitle>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <Badge variant={customer.subscription_status ? "success" : "secondary"}>
              {customer.subscription_status ? "Active" : "Inactive"}
            </Badge>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Joined</span>
            <span>{format(new Date(customer.joined_at), "PPP")}</span>
          </div>

          {customer.subscription_start_date && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subscription Start</span>
              <span>{format(new Date(customer.subscription_start_date), "PPP")}</span>
            </div>
          )}

          {customer.subscription_end_date && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subscription End</span>
              <span>{format(new Date(customer.subscription_end_date), "PPP")}</span>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
