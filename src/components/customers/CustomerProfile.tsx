import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Customer } from "@/hooks/community/useCustomers";

interface CustomerProfileProps {
  customer: Customer;
}

export const CustomerProfile = ({ customer }: CustomerProfileProps) => {
  return (
    <div className="flex flex-col items-center space-y-4">
      <Avatar className="h-24 w-24">
        <AvatarImage src={customer.avatar_url} alt={customer.full_name} />
        <AvatarFallback>{customer.full_name?.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="space-y-1 text-center">
        <h2 className="text-2xl font-semibold">{customer.full_name}</h2>
        <p className="text-muted-foreground">{customer.email}</p>
      </div>
      <div className="space-x-2">
        <Button variant="outline">Send Message</Button>
        <Button>View Orders</Button>
      </div>
    </div>
  );
};
