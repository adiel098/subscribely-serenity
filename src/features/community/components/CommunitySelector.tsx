
import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useCommunities } from "@/hooks/community/useCommunities";

export interface CommunitySelectorProps {
  selectedCommunityId: string;
  onSelect: (id: string) => void;
}

const CommunitySelector = ({ selectedCommunityId, onSelect }: CommunitySelectorProps) => {
  const [open, setOpen] = useState(false);
  const { data: communities, isLoading } = useCommunities();
  const selectedCommunity = communities?.find(c => c.id === selectedCommunityId);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {selectedCommunity ? selectedCommunity.name : "Select community..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search community..." />
          <CommandEmpty>No community found.</CommandEmpty>
          <CommandGroup>
            {communities?.map((community) => (
              <CommandItem
                key={community.id}
                onSelect={() => {
                  onSelect(community.id);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedCommunityId === community.id ? "opacity-100" : "opacity-0"
                  )}
                />
                {community.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default CommunitySelector;
