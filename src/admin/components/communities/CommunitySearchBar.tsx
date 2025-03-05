
import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface CommunitySearchBarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

export const CommunitySearchBar: React.FC<CommunitySearchBarProps> = ({
  searchTerm,
  setSearchTerm,
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="relative w-96">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or owner..."
          className="pl-8 w-full border-indigo-100"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>
  );
};
