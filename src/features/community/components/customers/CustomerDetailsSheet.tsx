
import { format } from "date-fns";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { CustomerDetailsSheetProps } from "@/types";

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
            <span>{format(new Date(customer.created_at), "PPP")}</span>
          </div>

          {customer.name && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name</span>
              <span>{customer.name}</span>
            </div>
          )}

          {customer.email && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span>{customer.email}</span>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
