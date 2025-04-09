
import { useNavigate } from "react-router-dom";
import { Bell, PlusCircle, FolderPlus, Plus, Copy, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCommunities } from "@/group_owners/hooks/useCommunities";
import { useProjects } from "@/group_owners/hooks/useProjects";
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
import { useProjectCommunities } from "../hooks/useProjectCommunities";
import { useBotSettings } from "../hooks/useBotSettings";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getBotUsername } from "@/telegram-mini-app/utils/telegram/botUsernameUtil";

export const CommunitySelector = () => {
  const { data: communities } = useCommunities();
  const { data: projects } = useProjects();
  const navigate = useNavigate();
  const { 
    selectedCommunityId, 
    setSelectedCommunityId,
    selectedProjectId,
    setSelectedProjectId,
    isProjectSelected
  } = useCommunityContext();
  
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [createProjectDialogOpen, setCreateProjectDialogOpen] = useState(false);
  const isMobile = useIsMobile();

  const selectedProject = projects?.find(project => project.id === selectedProjectId);
  const { data: projectCommunities } = useProjectCommunities(selectedProjectId);
  const selectedCommunity = communities?.find(comm => comm.id === selectedCommunityId);
  const botUsername = getBotUsername();
  
  const handleCreateProject = () => {
    navigate("/projects/new");
  };

  const handleCopyLink = () => {
    if (!selectedCommunityId && !selectedProjectId) {
      toast.error("Please select a community or project first");
      return;
    }

    let linkParam = "";
    let entityName = "";

    if (isProjectSelected && selectedProject) {
      // For projects, we might want to handle multiple communities
      // For now, just use the project ID
      linkParam = selectedProject.id;
      entityName = "project";
    } else if (selectedCommunity) {
      linkParam = selectedCommunity.custom_link || selectedCommunity.id;
      entityName = "community";
    }

    const fullLink = `https://t.me/${botUsername}?start=${linkParam}`;
    
    navigator.clipboard.writeText(fullLink)
      .then(() => {
        toast.success(`${entityName} link copied to clipboard!`);
      })
      .catch((error) => {
        console.error("Failed to copy link:", error);
        toast.error("Failed to copy link to clipboard");
      });
  };

  const handleEditLink = () => {
    if (!selectedCommunityId && !selectedProjectId) {
      toast.error("Please select a community or project first");
      return;
    }

    if (isProjectSelected && selectedProject) {
      navigate(`/projects/${selectedProject.id}/settings`);
    } else if (selectedCommunity) {
      navigate(`/communities/${selectedCommunity.id}/edit`);
    }
  };

  return (
    <>
      <motion.div 
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={`fixed top-16 left-0 right-0 z-30 flex ${isMobile ? 'flex-col' : 'items-center'} gap-2 md:gap-4 px-3 md:px-6 py-2 bg-gradient-to-r from-white/95 to-gray-50/95 border-b backdrop-blur-lg transition-all duration-300 shadow-sm ${isMobile ? 'h-auto pb-3' : 'h-[60px]'}`}
      >
        {isMobile ? (
          <>
            <div className="flex items-center w-full justify-between">
              <div className="flex-1 max-w-[60%]">
                <CommunityDropdown 
                  communities={communities} 
                  projects={projects}
                  selectedCommunityId={selectedCommunityId}
                  setSelectedCommunityId={setSelectedCommunityId}
                  selectedProjectId={selectedProjectId}
                  setSelectedProjectId={setSelectedProjectId}
                  isMobile={isMobile}
                />
              </div>
              <div className="flex items-center gap-1">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCopyLink}
                  className="flex items-center gap-1 text-xs p-1 rounded-md bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors h-8 w-8 justify-center"
                  title="Copy link"
                >
                  <Copy className="h-3.5 w-3.5" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleEditLink}
                  className="flex items-center gap-1 text-xs p-1 rounded-md bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors h-8 w-8 justify-center mx-1"
                  title="Edit link"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </motion.button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="h-8 w-8 rounded-full border-indigo-200 shadow-sm bg-white"
                    >
                      <Plus className="h-4 w-4 text-indigo-600" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-white border border-gray-100 shadow-md">
                    <DropdownMenuItem onClick={() => navigate("/connect/telegram")}>
                      <PlusCircle className="h-4 w-4 mr-2 text-blue-600" />
                      Add Community
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleCreateProject}>
                      <FolderPlus className="h-4 w-4 mr-2 text-purple-600" />
                      Add Project
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            <PlatformSubscriptionBanner />
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 md:gap-4 ml-[230px]">
              <CommunityDropdown 
                communities={communities} 
                projects={projects}
                selectedCommunityId={selectedCommunityId}
                setSelectedCommunityId={setSelectedCommunityId}
                selectedProjectId={selectedProjectId}
                setSelectedProjectId={setSelectedProjectId}
                isMobile={isMobile}
              />

              <PlatformSubscriptionBanner />
              
              {!isProjectSelected && <CommunityRequirementsBanner />}
              
              {isProjectSelected && selectedProject && projectCommunities && projectCommunities.length > 0 && (
                <MiniAppLinkButton 
                  community={projectCommunities[0]}
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
                  onClick={handleCreateProject}
                  className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 gap-2 shadow-sm hover:shadow transition-all duration-300 text-xs py-1 h-8 w-[130px]"
                  size="sm"
                >
                  <FolderPlus className="h-3.5 w-3.5" />
                  New Project
                </Button>
              </motion.div>
              
              <HeaderActions isMobile={isMobile} />
            </div>
          </>
        )}
      </motion.div>

      <AlertMessage 
        showAlert={showAlert}
        setShowAlert={setShowAlert}
        alertMessage={alertMessage}
      />
    </>
  );
};
