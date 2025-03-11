
import React from "react";
import { Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PaymentMethodFiltersProps {
  filter: string;
  onFilterChange: (value: string) => void;
}

export const PaymentMethodFilters = ({ filter, onFilterChange }: PaymentMethodFiltersProps) => {
  return (
    <div className="flex items-center gap-3">
      <Filter className="h-5 w-5 text-gray-500" />
      <Select value={filter} onValueChange={onFilterChange}>
        <SelectTrigger className="w-[200px] border-indigo-100 bg-white">
          <SelectValue placeholder="Filter payment methods" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="all">All payment methods</SelectItem>
            <SelectItem value="community">Specific to this community</SelectItem>
            <SelectItem value="default">Default payment methods</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};
