import { useNavigate } from "react-router-dom";
import { Bell, PlusCircle, FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCommunities } from "@/group_owners/hooks/useCommunities";
import { useCommunityGroups } from "@/group_owners/hooks/useCommunityGroups";
import { useCommunityContext } from "@/contexts/CommunityContext";
import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { CommunityDropdown } from "./community-selector/CommunityDropdown";
import { PlatformSubscriptionBanner } from "./community-selector/PlatformSubscriptionBanner";
import { MiniAppLinkButton } from "./community-selector/MiniAppLinkButton";
import { HeaderActions } from "./community-selector/HeaderActions";
import { AlertMessage } from "./community-selector/AlertMessage";
import { CommunityRequirementsBanner } from "./community-selector/CommunityRequirementsBanner";
import { CreateGroupDialog } from "./community-groups/CreateGroupDialog";
import { GroupMiniAppLinkButton } from "./community-groups/GroupMiniAppLinkButton";
import { useGroupMemberCommunities } from "../hooks/useGroupMemberCommunities";
import { useBotSettings } from "../hooks/useBotSettings";
import { useIsMobile } from "@/hooks/use-mobile";

export const CommunitySelector = () => {
  const { data: communities } = useCommunities();
  const { data: groups } = useCommunityGroups();
  const navigate = useNavigate();
  const { 
    selectedCommunityId, 
    setSelectedCommunityId,
    selectedGroupId,
    setSelectedGroupId,
    isGroupSelected
  } = useCommunityContext();
  
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [createGroupDialogOpen, setCreateGroupDialogOpen] = useState(false);
  const isMobile = useIsMobile();

  const selectedGroup = groups?.find(group => group.id === selectedGroupId);
  const { communities: groupCommunities } = useGroupMemberCommunities(selectedGroupId);
  
  const handleCreateCommunity = () => {
    navigate("/connect/telegram");
  };
  
  const handleCreateGroup = () => {
    setCreateGroupDialogOpen(true);
  };

  return (
    <>
      <motion.div 
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={`fixed top-16 left-0 right-0 z-10 flex ${isMobile ? 'flex-col' : 'items-center'} gap-2 md:gap-4 px-3 md:px-6 py-2 bg-gradient-to-r from-white/90 to-gray-50/90 border-b backdrop-blur-lg transition-all duration-300 shadow-sm ${isMobile ? 'h-auto pb-3' : 'h-[60px]'}`}
      >
        {isMobile ? (
          <>
            <div className="flex items-center w-full justify-between">
              <div className="flex-1 max-w-[60%]">
                <CommunityDropdown 
                  communities={communities} 
                  groups={groups}
                  selectedCommunityId={selectedCommunityId}
                  setSelectedCommunityId={setSelectedCommunityId}
                  selectedGroupId={selectedGroupId}
                  setSelectedGroupId={setSelectedGroupId}
                  isMobile={isMobile}
                />
              </div>
              <div className="flex items-center gap-2">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    variant="outline" 
                    onClick={handleCreateGroup}
                    className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 gap-2 shadow-sm hover:shadow transition-all duration-300 text-xs py-1 h-8 px-3"
                    size="sm"
                  >
                    <FolderPlus className="h-3.5 w-3.5" />
                    Group
                  </Button>
                </motion.div>
                <HeaderActions onNewCommunityClick={handleCreateCommunity} isMobile={isMobile} />
              </div>
            </div>
            
            <PlatformSubscriptionBanner />
            
            {!isGroupSelected && <CommunityRequirementsBanner />}
            
            {isGroupSelected && selectedGroup && (
              <GroupMiniAppLinkButton 
                group={selectedGroup}
                communities={groupCommunities}
              />
            )}
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 md:gap-4 ml-[230px]">
              <CommunityDropdown 
                communities={communities} 
                groups={groups}
                selectedCommunityId={selectedCommunityId}
                setSelectedCommunityId={setSelectedCommunityId}
                selectedGroupId={selectedGroupId}
                setSelectedGroupId={setSelectedGroupId}
                isMobile={isMobile}
              />

              <PlatformSubscriptionBanner />
              
              {!isGroupSelected && <CommunityRequirementsBanner />}
              
              {isGroupSelected && selectedGroup && (
                <GroupMiniAppLinkButton 
                  group={selectedGroup}
                  communities={groupCommunities}
                />
              )}
            </div>

            <div className="flex items-center gap-4 ml-auto">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  variant="outline" 
                  onClick={handleCreateGroup}
                  className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 gap-2 shadow-sm hover:shadow transition-all duration-300 text-xs py-1 h-8 w-[130px]"
                  size="sm"
                >
                  <FolderPlus className="h-3.5 w-3.5" />
                  New Group
                </Button>
              </motion.div>
              
              <HeaderActions onNewCommunityClick={handleCreateCommunity} isMobile={isMobile} />
            </div>
          </>
        )}
      </motion.div>

      <AlertMessage 
        showAlert={showAlert}
        setShowAlert={setShowAlert}
        alertMessage={alertMessage}
      />
      
      <CreateGroupDialog 
        isOpen={createGroupDialogOpen}
        onOpenChange={setCreateGroupDialogOpen}
      />
    </>
  );
};
