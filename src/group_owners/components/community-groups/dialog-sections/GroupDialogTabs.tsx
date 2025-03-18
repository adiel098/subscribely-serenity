
import React from "react";
import { Users, Edit } from "lucide-react";

interface GroupDialogTabsProps {
  activeTab: 'details' | 'communities';
  setActiveTab: (tab: 'details' | 'communities') => void;
}

export const GroupDialogTabs: React.FC<GroupDialogTabsProps> = ({
  activeTab,
  setActiveTab
}) => {
  return (
    <div className="flex border-b">
      <button
        className={`px-4 py-2 flex items-center gap-1.5 ${
          activeTab === 'details' 
            ? 'text-purple-600 border-b-2 border-purple-600 font-medium' 
            : 'text-gray-500 hover:text-purple-500 transition-colors'
        }`}
        onClick={() => setActiveTab('details')}
      >
        <Edit className="h-4 w-4" />
        Group Details
      </button>
      <button
        className={`px-4 py-2 flex items-center gap-1.5 ${
          activeTab === 'communities' 
            ? 'text-purple-600 border-b-2 border-purple-600 font-medium' 
            : 'text-gray-500 hover:text-purple-500 transition-colors'
        }`}
        onClick={() => setActiveTab('communities')}
      >
        <Users className="h-4 w-4" />
        Communities
      </button>
    </div>
  );
};
