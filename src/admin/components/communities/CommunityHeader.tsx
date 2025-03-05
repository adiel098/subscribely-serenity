
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const CommunityHeader: React.FC = () => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Communities</h1>
        <p className="text-muted-foreground">
          Manage all platform communities 🌐
        </p>
      </div>
      <Button className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2">
        <Plus className="h-4 w-4" />
        New Community
      </Button>
    </div>
  );
};
