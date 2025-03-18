
import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  setSearchQuery
}) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
      <Input
        placeholder="Search communities by name..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-10 bg-white"
      />
    </div>
  );
};
