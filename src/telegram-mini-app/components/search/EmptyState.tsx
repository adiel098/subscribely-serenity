
import React from "react";
import { Search } from "lucide-react";

interface EmptyStateProps {
  searchQuery: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ searchQuery }) => {
  return (
    <div className="text-center py-10 space-y-3">
      <Search className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
      <h3 className="text-lg font-medium">No communities found</h3>
      <p className="text-muted-foreground text-sm max-w-sm mx-auto">
        {searchQuery 
          ? `No communities matching "${searchQuery}". Try a different search term.` 
          : "Try searching for communities by name or browse our featured communities."}
      </p>
    </div>
  );
};
