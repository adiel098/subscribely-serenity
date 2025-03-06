
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface PaymentSearchProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  paymentType: "platform" | "community";
}

export const PaymentSearch = ({ 
  searchQuery, 
  onSearchChange, 
  paymentType 
}: PaymentSearchProps) => {
  return (
    <div className="relative w-96">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={`Search ${paymentType === "platform" ? "platform" : "community"} payments...`}
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-8 border-indigo-100"
      />
    </div>
  );
};
