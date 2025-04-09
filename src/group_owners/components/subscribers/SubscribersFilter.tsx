
import React from "react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SubscribersFilterProps {
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export const SubscribersFilter: React.FC<SubscribersFilterProps> = ({
  statusFilter,
  onStatusFilterChange,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <Tabs defaultValue={statusFilter} onValueChange={onStatusFilterChange} className="w-auto">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
          <TabsTrigger value="trial">Trial</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="w-full sm:w-auto sm:ml-auto">
        <Input
          placeholder="Search subscribers..."
          className="max-w-sm"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
};
