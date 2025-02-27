
import React from "react";
import { UserPlus, LayoutGrid, Search } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid grid-cols-3 mb-6 bg-primary/5">
        <TabsTrigger value="subscribe" className="flex items-center gap-1.5">
          <UserPlus className="h-4 w-4" />
          <span className="hidden sm:inline">Subscribe</span>
        </TabsTrigger>
        <TabsTrigger value="mySubscriptions" className="flex items-center gap-1.5">
          <LayoutGrid className="h-4 w-4" />
          <span className="hidden sm:inline">My Memberships</span>
        </TabsTrigger>
        <TabsTrigger value="discover" className="flex items-center gap-1.5">
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">Discover</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
