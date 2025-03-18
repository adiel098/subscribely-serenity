
import React from "react";
import { Users } from "lucide-react";

export const SectionHeader: React.FC = () => {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium flex items-center gap-1.5">
        <Users className="h-4 w-4 text-purple-600" />
        Select Communities for this Group
      </h3>
      <p className="text-xs text-gray-500">
        Selected communities will appear in this group and be accessible to subscribers 🔑
      </p>
    </div>
  );
};
