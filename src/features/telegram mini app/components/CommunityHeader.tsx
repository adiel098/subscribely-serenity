
import { Star } from "lucide-react";
import { Badge } from "@/features/telegram mini app/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/features/telegram mini app/components/ui/avatar";
import { Community } from "../pages/TelegramMiniApp";

interface CommunityHeaderProps {
  community: Community;
}

export const CommunityHeader = ({ community }: CommunityHeaderProps) => {
  return (
    <div className="text-center space-y-4">
      <div className="flex justify-center">
        <Avatar className="h-24 w-24">
          {community.telegram_photo_url ? (
            <AvatarImage src={community.telegram_photo_url} alt={community.name} />
          ) : (
            <AvatarFallback>{community.name.charAt(0)}</AvatarFallback>
          )}
        </Avatar>
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">{community.name}</h1>
        {community.description && (
          <p className="text-muted-foreground max-w-md mx-auto">
            {community.description}
          </p>
        )}
        <div className="flex items-center justify-center space-x-2">
          <Badge variant="secondary" className="text-yellow-600 bg-yellow-50">
            <Star className="w-3 h-3 mr-1" />
            Premium Community
          </Badge>
        </div>
      </div>
    </div>
  );
};
