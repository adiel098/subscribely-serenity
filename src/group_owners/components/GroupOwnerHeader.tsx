
import { useState } from 'react';
import { useAuth } from '@/auth/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Bell, Crown, User, Settings, LogOut, HelpCircle, PlusCircle, FolderPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { CommunityDropdown } from './community-selector/CommunityDropdown';
import { useCommunities } from '@/group_owners/hooks/useCommunities';
import { useCommunityGroups } from '@/group_owners/hooks/useCommunityGroups';
import { useCommunityContext } from '@/contexts/CommunityContext';
import { HeaderActions } from './community-selector/HeaderActions';
import { toast } from 'sonner';
import { getBotUsername } from '@/telegram-mini-app/utils/telegram/botUsernameUtil';
import { CommunityRequirementsBanner } from './community-selector/CommunityRequirementsBanner';
import { CreateGroupDialog } from './community-groups/CreateGroupDialog';
import { PlatformSubscriptionBanner } from './community-selector/PlatformSubscriptionBanner';

export function GroupOwnerHeader() {
  const {
    signOut,
    user
  } = useAuth();
  const navigate = useNavigate();
  const [showHelp, setShowHelp] = useState(false);
  const isMobile = useIsMobile();
  const [createGroupDialogOpen, setCreateGroupDialogOpen] = useState(false);
  
  // Community selector data
  const { data: communities } = useCommunities();
  const { data: groups } = useCommunityGroups();
  const { 
    selectedCommunityId, 
    setSelectedCommunityId,
    selectedGroupId,
    setSelectedGroupId,
    isGroupSelected
  } = useCommunityContext();
  
  const selectedGroup = groups?.find(group => group.id === selectedGroupId);
  const selectedCommunity = communities?.find(comm => comm.id === selectedCommunityId);
  const botUsername = getBotUsername();
  
  const getInitials = () => {
    if (!user?.email) return 'U';
    return user.email.charAt(0).toUpperCase();
  };
  
  const handleSignOut = async () => {
    try {
      await signOut();
      console.log("User logged out from GroupOwnerHeader");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  
  const navigateToAccountSettings = () => {
    navigate('/membify-settings');
  };
  
  const handleCreateGroup = () => {
    setCreateGroupDialogOpen(true);
  };
  
  const handleCopyLink = () => {
    if (!selectedCommunityId && !selectedGroupId) {
      toast.error("Please select a community or group first");
      return;
    }

    let linkParam = "";
    let entityName = "";

    if (isGroupSelected && selectedGroup) {
      linkParam = selectedGroup.custom_link || selectedGroup.id;
      entityName = "group";
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
    if (!selectedCommunityId && !selectedGroupId) {
      toast.error("Please select a community or group first");
      return;
    }

    if (isGroupSelected && selectedGroup) {
      navigate(`/groups/${selectedGroup.id}/edit`);
    } else if (selectedCommunity) {
      navigate(`/communities/${selectedCommunity.id}/edit`);
    }
  };
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 shadow-sm backdrop-blur-sm flex items-center justify-between px-4 md:px-6 h-16">
      <motion.div 
        initial={{
          opacity: 0,
          x: -20
        }} 
        animate={{
          opacity: 1,
          x: 0
        }} 
        transition={{
          duration: 0.4,
          ease: "easeOut"
        }} 
        className="flex items-center gap-2 md:gap-3"
      >
        <Link to="/dashboard" className="text-lg md:text-xl font-bold flex items-center gap-1 md:gap-2">
          <Crown className="h-5 w-5 md:h-6 md:w-6 text-amber-500 drop-shadow-sm" /> 
          <span className="font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-500 bg-clip-text text-transparent">
            {isMobile ? "Membify" : "Membify"}
          </span>
        </Link>
        
        {/* Community selector integrated into header */}
        {!isMobile ? (
          <div className="ml-6 flex items-center gap-6">
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
            
            {/* We only need the CommunityRequirementsBanner here - it handles showing both the requirements banner
                and the success banner based on community/group configuration */}
            <CommunityRequirementsBanner />
          </div>
        ) : null}
      </motion.div>
      
      {/* For mobile, add the selector below the main header */}
      {isMobile && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-white/90 border-b flex flex-col items-center justify-between px-3 py-3 shadow-sm">
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
              <HeaderActions isMobile={isMobile} />
              
              {/* Add Group Button for mobile */}
              <Button 
                variant="outline" 
                size="icon"
                className="h-8 w-8 rounded-full border-indigo-200 shadow-sm bg-white"
                onClick={handleCreateGroup}
              >
                <FolderPlus className="h-4 w-4 text-indigo-600" />
              </Button>
            </div>
          </div>
          
          <div className="w-full mt-2">
            <PlatformSubscriptionBanner />
            
            {/* CommunityRequirementsBanner for mobile - it will handle both requirements and success banners */}
            <div className="mt-2">
              <CommunityRequirementsBanner />
            </div>
          </div>
        </div>
      )}
      
      <div className="flex items-center space-x-2 md:space-x-3">
        {/* Move New Community and New Group buttons here */}
        {!isMobile && (
          <div className="flex items-center gap-2 mr-3">
            <HeaderActions isMobile={isMobile} />

            {/* Add Group Button */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                variant="outline" 
                onClick={handleCreateGroup}
                className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 gap-2 shadow-sm hover:shadow transition-all duration-300 text-xs py-1 h-8"
                size="sm"
              >
                <FolderPlus className="h-3.5 w-3.5" />
                New Group
              </Button>
            </motion.div>
          </div>
        )}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.div 
              whileHover={{
                scale: 1.05
              }} 
              whileTap={{
                scale: 0.95
              }}
            >
              <Button variant="ghost" className="relative h-9 w-9 md:h-10 md:w-10 rounded-full hover:bg-indigo-200/50 border-2 border-indigo-300">
                <Avatar className="h-7 w-7 md:h-8 md:w-8">
                  <AvatarImage alt="Profile" src="/lovable-uploads/fe0652ed-b292-4987-b51f-3706d2bdd013.png" />
                  <AvatarFallback className="bg-gradient-to-br from-blue-400 to-indigo-600 text-white font-bold">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </motion.div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 border-blue-100 shadow-xl">
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex items-center cursor-pointer py-2" onClick={navigateToAccountSettings}>
              <Settings className="mr-2 h-4 w-4 text-blue-600" />
              <span>Account Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex items-center text-red-600 cursor-pointer hover:text-red-700 hover:bg-red-50 py-2" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {showHelp && (
        <motion.div 
          initial={{
            opacity: 0,
            y: 10
          }} 
          animate={{
            opacity: 1,
            y: 0
          }} 
          exit={{
            opacity: 0,
            y: 10
          }} 
          className="absolute top-16 right-6 bg-white rounded-lg shadow-xl p-4 w-72 border border-blue-100 z-50"
        >
          <h3 className="text-lg font-bold text-blue-700 mb-2 flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-blue-500" />
            Need Help?
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            If you need assistance with managing your communities or subscriptions, our support team is here to help.
          </p>
          <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
            Contact Support
          </Button>
        </motion.div>
      )}
      
      {/* Create Group Dialog */}
      <CreateGroupDialog 
        isOpen={createGroupDialogOpen}
        onOpenChange={setCreateGroupDialogOpen}
      />
    </header>
  );
}
