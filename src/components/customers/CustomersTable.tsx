
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building2, ChevronRight, User } from "lucide-react";
import { format } from "date-fns";
import type { Customer } from "@/hooks/useCustomers";

interface CustomersTableProps {
  customers: Customer[];
  onCustomerSelect: (customerId: string) => void;
}

export const CustomersTable = ({ customers, onCustomerSelect }: CustomersTableProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="border rounded-lg bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Customer</TableHead>
            <TableHead>Communities</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Registered</TableHead>
            <TableHead>Last Login</TableHead>
            <TableHead className="w-[100px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No customers found
              </TableCell>
            </TableRow>
          ) : (
            customers.map((customer) => (
              <TableRow key={customer.id} className="group">
                <TableCell>
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={customer.avatar_url || undefined} />
                      <AvatarFallback>
                        {customer.company_name ? (
                          <Building2 className="h-4 w-4" />
                        ) : (
                          <User className="h-4 w-4" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {customer.full_name || 'No name'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {customer.email || 'No email'}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">
                      {customer.communities?.length || 0}
                    </span>
                    {customer.communities?.length > 0 && (
                      <span className="text-sm text-muted-foreground">
                        ({customer.communities[0].name}
                        {customer.communities.length > 1
                          ? ` +${customer.communities.length - 1}`
                          : ''})
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(customer.status)}>
                    {customer.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {customer.registration_date
                    ? format(new Date(customer.registration_date), 'PP')
                    : '-'}
                </TableCell>
                <TableCell>
                  {customer.last_login
                    ? format(new Date(customer.last_login), 'PP')
                    : 'Never'}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onCustomerSelect(customer.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight className="h-4 w-4" />
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
