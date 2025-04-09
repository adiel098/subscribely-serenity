
import React from "react";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptySubscribersProps {
  isProjectSelected: boolean;
}

export const EmptySubscribers: React.FC<EmptySubscribersProps> = ({
  isProjectSelected
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed border-gray-300 rounded-lg bg-gray-50">
      <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
        <Users className="h-6 w-6 text-purple-600" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">
        No subscribers yet
      </h3>
      <p className="text-gray-500 text-center max-w-md mb-6">
        {isProjectSelected 
          ? "This project doesn't have any subscribers yet. Share your subscription link to get started."
          : "This community doesn't have any subscribers yet. Share your community link to get started."}
      </p>
      <div className="space-x-3">
        <Button>
          Invite Subscribers
        </Button>
      </div>
    </div>
  );
};
