
import React from "react";
import { Button } from "@/components/ui/button";

interface SelectedCounterProps {
  selectedCount: number;
  onClearSelection: () => void;
}

export const SelectedCounter: React.FC<SelectedCounterProps> = ({
  selectedCount,
  onClearSelection
}) => {
  return (
    <div className="flex justify-between items-center mt-2 px-1">
      <p className="text-sm text-gray-600">
        <span className="font-medium">{selectedCount}</span> communities selected
      </p>
      {selectedCount > 0 && (
        <Button
          variant="outline"
          size="sm"
          onClick={onClearSelection}
          className="text-xs h-7 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
        >
          Clear Selection
        </Button>
      )}
    </div>
  );
};
