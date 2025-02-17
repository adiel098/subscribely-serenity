
import { Eye, MoreHorizontal } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/features/community/components/ui/table";
import { Badge } from "@/features/community/components/ui/badge";
import { Button } from "@/features/community/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/features/community/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/features/community/components/ui/dropdown-menu";
import { useCustomers } from "@/hooks/community/useCustomers";

interface Customer {
  id: string;
  full_name: string;
  email: string;
  status: "active" | "inactive";
  profile_image_url: string | null;
  created_at: string;
}

interface CustomersTableProps {
  data: Customer[];
  onViewDetails: (customer: Customer) => void;
}

export const CustomersTable = ({ data, onViewDetails }: CustomersTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Customer</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Join Date</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((customer) => (
          <TableRow key={customer.id}>
            <TableCell className="font-medium">
              <div className="flex items-center space-x-3">
                <Avatar>
                  {customer.profile_image_url ? (
                    <AvatarImage src={customer.profile_image_url} />
                  ) : (
                    <AvatarFallback>
                      {customer.full_name.charAt(0)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <span>{customer.full_name}</span>
              </div>
            </TableCell>
            <TableCell>{customer.email}</TableCell>
            <TableCell>
              <Badge
                variant={customer.status === "active" ? "success" : "secondary"}
              >
                {customer.status}
              </Badge>
            </TableCell>
            <TableCell>
              {new Date(customer.created_at).toLocaleDateString()}
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => onViewDetails(customer)}
                    className="cursor-pointer"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
