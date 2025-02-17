import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Customer } from "@/hooks/community/useCustomers";

interface CustomerDetailsSheetProps {
  customer: Customer;
}

export const CustomerDetailsSheet = ({ customer }: CustomerDetailsSheetProps) => {
  return (
    <Sheet>
      <SheetContent className="sm:max-w-[425px]">
        <SheetHeader>
          <SheetTitle>Customer Details</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={customer.avatar_url || ""} alt={customer.full_name} />
              <AvatarFallback>{customer.full_name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-semibold">{customer.full_name}</p>
              <p className="text-sm text-muted-foreground">{customer.email}</p>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium">Subscription Status:</p>
            <p className="text-sm text-muted-foreground">{customer.subscription_status ? "Active" : "Inactive"}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Joined At:</p>
            <p className="text-sm text-muted-foreground">{new Date(customer.joined_at).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Subscription Start Date:</p>
            <p className="text-sm text-muted-foreground">{customer.subscription_start_date ? new Date(customer.subscription_start_date).toLocaleDateString() : "N/A"}</p>
          </div>
          {customer.plan && (
            <div>
              <p className="text-sm font-medium">Plan:</p>
              <p className="text-sm text-muted-foreground">{customer.plan.name}</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
