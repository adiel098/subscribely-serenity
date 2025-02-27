
import React from "react";
import { CommunitySearch } from "@/telegram-mini-app/components/CommunitySearch";

interface DiscoverTabContentProps {
  onSelectCommunity: (selectedCommunity: any) => void;
}

export const DiscoverTabContent: React.FC<DiscoverTabContentProps> = ({
  onSelectCommunity
}) => {
  return (
    <div className="bg-white rounded-lg border border-primary/10 shadow-sm p-4 md:p-6">
      <CommunitySearch onSelectCommunity={onSelectCommunity} />
    </div>
  );
};
