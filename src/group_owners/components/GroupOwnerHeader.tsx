import { useState } from 'react';
import { useAuth } from '@/auth/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { CommunityDropdown } from './community-selector/CommunityDropdown';
import { useCommunities } from '@/group_owners/hooks/useCommunities';
import { useCommunityGroups } from '@/group_owners/hooks/useCommunityGroups';
import { useCommunityContext } from '@/contexts/CommunityContext';
import { HeaderActions } from './community-selector/HeaderActions';
import { getBotUsername } from '@/telegram-mini-app/utils/telegram/botUsernameUtil';
import { CommunityRequirementsBanner } from './community-selector/CommunityRequirementsBanner';
import { CreateGroupDialog } from './community-groups/CreateGroupDialog';
import { PlatformSubscriptionBanner } from './community-selector/PlatformSubscriptionBanner';
import { CommunityEditBanner } from './community-selector/CommunityEditBanner';

// Import new components
import { Logo } from './header/Logo';
import { ProfileMenu } from './header/ProfileMenu';
import { CreateNewButton } from './header/CreateNewButton';
import { MobileActions } from './header/MobileActions';
import { HelpDialog } from './header/HelpDialog';

export function GroupOwnerHeader() {
  const { signOut, user } = useAuth();
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
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 shadow-sm backdrop-blur-sm flex flex-col md:flex-row items-center justify-between px-4 md:px-6 h-14 md:h-16">
      <div className="w-full flex items-center justify-between h-full">
        {/* Left side - Logo and Community Selection */}
        <div className="flex items-center gap-3">
          <Logo />

          {/* Community selector for mobile */}
          <div className="md:hidden flex items-center gap-2">
            <div className="max-w-[120px]">
              <CommunityDropdown 
                communities={communities} 
                groups={groups}
                selectedCommunityId={selectedCommunityId}
                setSelectedCommunityId={setSelectedCommunityId}
                selectedGroupId={selectedGroupId}
                setSelectedGroupId={setSelectedGroupId}
                isMobile={true}
              />
            </div>
            
            <MobileActions 
              selectedCommunityId={selectedCommunityId}
              selectedGroupId={selectedGroupId}
              isGroupSelected={isGroupSelected}
              botUsername={botUsername}
            />
          </div>

          {/* Desktop view - Community Selection and Banners */}
          {!isMobile && (
            <div className="hidden md:flex items-center gap-6 ml-6">
              <div className="flex items-center gap-2">
                <CommunityDropdown 
                  communities={communities} 
                  groups={groups}
                  selectedCommunityId={selectedCommunityId}
                  setSelectedCommunityId={setSelectedCommunityId}
                  selectedGroupId={selectedGroupId}
                  setSelectedGroupId={setSelectedGroupId}
                  isMobile={false}
                />
              </div>
              
              <PlatformSubscriptionBanner />
              <CommunityRequirementsBanner />
              
            </div>
          )}
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-4">
          {/* Mobile Actions */}
          <div className="flex items-center gap-1 md:hidden">
            <CreateNewButton handleCreateGroup={handleCreateGroup} isMobile={true} />
            <ProfileMenu 
              getInitials={getInitials}
              navigateToAccountSettings={navigateToAccountSettings}
              handleSignOut={handleSignOut}
              isMobile={true}
            />
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2">
              <CreateNewButton handleCreateGroup={handleCreateGroup} isMobile={false} />
              <HeaderActions isMobile={false} />
            </div>

            <ProfileMenu 
              getInitials={getInitials}
              navigateToAccountSettings={navigateToAccountSettings}
              handleSignOut={handleSignOut}
              isMobile={false}
            />
          </div>
        </div>
      </div>

      <HelpDialog show={showHelp} />
      
      {/* Create Group Dialog */}
      <CreateGroupDialog 
        isOpen={createGroupDialogOpen}
        onOpenChange={setCreateGroupDialogOpen}
      />
    </header>
  );
}
