
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCommunities } from "@/features/community/hooks/useCommunities";
import type { CommunitySelectorProps } from "@/types";

export const CommunitySelector = ({ selectedCommunityId, onSelect }: CommunitySelectorProps) => {
  const { data: communities, isLoading } = useCommunities();

  if (isLoading || !communities?.length) {
    return null;
  }

  return (
    <Select value={selectedCommunityId} onValueChange={onSelect}>
      <SelectTrigger className="w-[280px]">
        <SelectValue placeholder="Select a community" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Your Communities</SelectLabel>
          {communities.map((community) => (
            <SelectItem key={community.id} value={community.id}>
              {community.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
