import { useNavigate } from "react-router-dom";
import { UserButton } from "@/auth/components/UserButton";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Menu, Plus, PlusCircle, FolderPlus, Copy, Edit2 } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { MobileSidebar } from "./MobileSidebar";
import { useProjectContext } from "@/contexts/ProjectContext";
import { useCommunities } from "@/group_owners/hooks/useCommunities";
import { useProjects } from "@/group_owners/hooks/useProjects";
import { CommunityDropdown } from "./community-selector/CommunityDropdown";
import { PlatformSubscriptionBanner } from "./community-selector/PlatformSubscriptionBanner";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { getBotUsername } from "@/telegram-mini-app/utils/telegram/botUsernameUtil";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function GroupOwnerHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  
  // נוסיף את הדאטה והפונקציות הדרושות מהפרויקט
  const { data: communities } = useCommunities();
  const { data: projects } = useProjects();
  const { 
    selectedCommunityId, 
    setSelectedCommunityId,
    selectedProjectId,
    setSelectedProjectId,
    isProjectSelected
  } = useProjectContext();
  
  const selectedProject = projects?.find(project => project.id === selectedProjectId);
  const selectedCommunity = communities?.find(comm => comm.id === selectedCommunityId);
  const botUsername = getBotUsername();
  
  // יצירת פונקציות הנדרשות
  const handleCreateProject = () => {
    navigate("/projects/new");
  };

  const handleCopyLink = () => {
    if (!selectedCommunityId && !selectedProjectId) {
      toast.error("יש לבחור קהילה או פרויקט תחילה");
      return;
    }

    let linkParam = "";
    let entityName = "";

    if (isProjectSelected && selectedProject) {
      linkParam = selectedProject.id;
      entityName = "פרויקט";
    } else if (selectedCommunity) {
      linkParam = selectedCommunity.custom_link || selectedCommunity.id;
      entityName = "קהילה";
    }

    const fullLink = `https://t.me/${botUsername}?start=${linkParam}`;
    
    navigator.clipboard.writeText(fullLink)
      .then(() => {
        toast.success(`קישור ל${entityName} הועתק ללוח!`);
      })
      .catch((error) => {
        console.error("Failed to copy link:", error);
        toast.error("שגיאה בהעתקת הקישור");
      });
  };

  const handleEditLink = () => {
    if (!selectedCommunityId && !selectedProjectId) {
      toast.error("יש לבחור קהילה או פרויקט תחילה");
      return;
    }

    if (isProjectSelected && selectedProject) {
      navigate(`/projects/${selectedProject.id}/settings`);
    } else if (selectedCommunity) {
      navigate(`/communities/${selectedCommunity.id}/edit`);
    }
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full shrink-0 items-center gap-4 border-b bg-gradient-to-b from-background/10 via-background/80 to-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
      {isMobile && (
        <>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsMenuOpen(true)}
            className="flex md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetContent side="left" className="p-0 pt-10">
              <MobileSidebar onClose={() => setIsMenuOpen(false)} />
            </SheetContent>
          </Sheet>
        </>
      )}

      <div className="flex items-center gap-2">
        <div
          className="flex cursor-pointer items-center gap-3"
          onClick={() => navigate("/dashboard")}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-600 text-white font-semibold">
            M
          </div>
          {!isMobile && <span className="text-lg font-semibold">Membify</span>}
        </div>
      </div>

      {/* סרגל בחירת הפרויקט/קהילה */}
      <div className="flex-1 flex items-center justify-center gap-4">
        <CommunityDropdown 
          communities={communities} 
          projects={projects}
          selectedCommunityId={selectedCommunityId}
          setSelectedCommunityId={setSelectedCommunityId}
          selectedProjectId={selectedProjectId}
          setSelectedProjectId={setSelectedProjectId}
          isMobile={isMobile}
        />
        
        <div className="flex items-center gap-1">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCopyLink}
            className="flex items-center gap-1 text-xs p-1 rounded-md bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors h-8 w-8 justify-center"
            title="העתק קישור"
          >
            <Copy className="h-3.5 w-3.5" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleEditLink}
            className="flex items-center gap-1 text-xs p-1 rounded-md bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors h-8 w-8 justify-center mx-1"
            title="ערוך קישור"
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
                הוסף קהילה
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCreateProject}>
                <FolderPlus className="h-4 w-4 mr-2 text-purple-600" />
                הוסף פרויקט
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <PlatformSubscriptionBanner />
      </div>

      <div className="ml-auto flex items-center">
        <UserButton />
      </div>
    </header>
  );
}
