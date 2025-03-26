import { Pencil, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useCommunityContext } from "@/contexts/CommunityContext";

interface CommunityActionsProps {
  communityId?: string;
  groupId?: string;
  isMobile?: boolean;
  botUsername?: string;
}

export const CommunityActions = ({ communityId, groupId, isMobile = false, botUsername }: CommunityActionsProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isGroupSelected } = useCommunityContext();

  const handleCopyLink = async () => {
    if (!communityId && !groupId) {
      toast({
        title: "No selection",
        description: "Please select a community or group first",
        variant: "destructive"
      });
      return;
    }

    let linkParam = "";
    let entityName = "";

    if (isGroupSelected && groupId) {
      linkParam = groupId;
      entityName = "group";
    } else if (communityId) {
      linkParam = communityId;
      entityName = "community";
    }

    try {
      const miniAppLink = `https://t.me/${botUsername}?start=${linkParam}`;
      await navigator.clipboard.writeText(miniAppLink);
      toast({
        title: "Link copied",
        description: `${entityName} link has been copied to clipboard`
      });
    } catch (error) {
      console.error("Failed to copy link:", error);
      toast({
        title: "Copy failed",
        description: "Failed to copy link to clipboard",
        variant: "destructive"
      });
    }
  };

  const handleEditLink = () => {
    if (!communityId && !groupId) {
      toast({
        title: "No selection",
        description: "Please select a community or group first",
        variant: "destructive"
      });
      return;
    }

    if (isGroupSelected && groupId) {
      navigate(`/groups/${groupId}/edit`);
    } else if (communityId) {
      navigate(`/communities/${communityId}/edit`);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-6 w-6"
        onClick={handleEditLink}
      >
        <Pencil className="h-3 w-3 text-blue-600" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-6 w-6"
        onClick={handleCopyLink}
      >
        <Copy className="h-3 w-3 text-blue-600" />
      </Button>
    </div>
  );
};
