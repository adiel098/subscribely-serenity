
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useCommunities } from "@/hooks/useCommunities";
import { useCommunityContext } from "@/contexts/CommunityContext";

export const CommunitySelector = () => {
  const { data: communities } = useCommunities();
  const navigate = useNavigate();
  const { selectedCommunityId, setSelectedCommunityId } = useCommunityContext();

  return (
    <div className="fixed top-16 left-[280px] right-0 z-10 flex items-center justify-between gap-4 px-8 py-4 bg-white/80 border-b backdrop-blur-lg transition-all duration-300 shadow-sm">
      <Select value={selectedCommunityId || undefined} onValueChange={setSelectedCommunityId}>
        <SelectTrigger className="w-[250px]">
          <SelectValue placeholder="Select community" />
        </SelectTrigger>
        <SelectContent>
          {communities?.map(community => (
            <SelectItem key={community.id} value={community.id}>
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={community.telegram_photo_url || undefined} />
                  <AvatarFallback className="bg-primary/5 text-primary/70">
                    {community.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {community.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="default" onClick={() => navigate("/platform-select")}>
          New Community
        </Button>
      </div>
    </div>
  );
};
