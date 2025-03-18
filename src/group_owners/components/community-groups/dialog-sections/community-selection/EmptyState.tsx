
import React from "react";

interface EmptyStateProps {
  searchQuery: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ searchQuery }) => {
  return (
    <div className="text-center py-8 bg-gray-50 rounded-md">
      <p className="text-gray-500">
        {searchQuery 
          ? "No communities found matching your search 🔍" 
          : "No communities available 📭"}
      </p>
    </div>
  );
};
