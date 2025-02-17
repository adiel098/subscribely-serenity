
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { Customer } from "@/hooks/useCustomers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarIcon, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CustomerProfileProps {
  customer: Customer;
}

export const CustomerProfile = ({ customer }: CustomerProfileProps) => {
  return (
    <div className="space-y-6 py-6">
      <div className="flex items-start space-x-6">
        <Avatar className="h-20 w-20">
          <AvatarImage src={customer.avatar_url || undefined} />
          <AvatarFallback>
            <User className="h-8 w-8" />
          </AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">{customer.full_name}</h2>
          <p className="text-muted-foreground">{customer.email}</p>
          <Badge variant={
            customer.status === 'active' ? 'default' :
            customer.status === 'suspended' ? 'destructive' : 'secondary'
          }>
            {customer.status}
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
          <CardDescription>View and edit customer details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="registrationDate">Registration Date</Label>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <CalendarIcon className="h-4 w-4" />
                <span>
                  {customer.registration_date
                    ? format(new Date(customer.registration_date), 'PPP')
                    : 'Unknown'}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastLogin">Last Login</Label>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <CalendarIcon className="h-4 w-4" />
                <span>
                  {customer.last_login
                    ? format(new Date(customer.last_login), 'PPP')
                    : 'Never'}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Company Name</Label>
            <Input
              id="company"
              defaultValue={customer.company_name || ''}
              placeholder="Enter company name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              defaultValue={customer.phone || ''}
              placeholder="Enter phone number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              defaultValue={customer.notes || ''}
              placeholder="Add notes about this customer"
              rows={4}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button>Save Changes</Button>
        </CardFooter>
      </Card>
    </div>
  );
};
