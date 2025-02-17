
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useCommunities } from "@/hooks/community/useCommunities";
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface CommunitySelectorProps {
  selectedCommunityId: string | null;
  onSelect: (communityId: string) => void;
}

const CommunitySelector = ({ selectedCommunityId, onSelect }: CommunitySelectorProps) => {
  const { data: communities, isLoading } = useCommunities();
  const [isOpen, setIsOpen] = useState(false);

  if (isLoading) {
    return (
      <Button variant="outline" className="w-[200px]">
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  const selectedCommunity = communities?.find(
    (community) => community.id === selectedCommunityId
  );

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-[200px] justify-start">
          {selectedCommunity?.name || "Select Community"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[200px]">
        {communities?.map((community) => (
          <DropdownMenuItem
            key={community.id}
            onClick={() => {
              onSelect(community.id);
              setIsOpen(false);
            }}
          >
            {community.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CommunitySelector;
