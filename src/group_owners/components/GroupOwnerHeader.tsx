
import { useState } from 'react';
import { useAuth } from '@/auth/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Bell, Crown, User, Settings, LogOut, HelpCircle, PlusCircle } from 'lucide-react';
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

export function GroupOwnerHeader() {
  const {
    signOut,
    user
  } = useAuth();
  const navigate = useNavigate();
  const [showHelp, setShowHelp] = useState(false);
  const isMobile = useIsMobile();
  
  // Community selector data
  const { data: communities } = useCommunities();
  const { data: groups } = useCommunityGroups();
  const { 
    selectedCommunityId, 
    setSelectedCommunityId,
    selectedGroupId,
    setSelectedGroupId
  } = useCommunityContext();
  
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
  
  const handleCopyLink = () => {
    // This is a placeholder - the actual functionality will be handled by the community selector components
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
          <div className="ml-6 flex items-center gap-2">
            <CommunityDropdown 
              communities={communities} 
              groups={groups}
              selectedCommunityId={selectedCommunityId}
              setSelectedCommunityId={setSelectedCommunityId}
              selectedGroupId={selectedGroupId}
              setSelectedGroupId={setSelectedGroupId}
              isMobile={isMobile}
            />
            <HeaderActions isMobile={isMobile} />
          </div>
        ) : null}
      </motion.div>
      
      {/* For mobile, add the selector below the main header */}
      {isMobile && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-white/90 border-b flex items-center justify-between px-3 py-2 shadow-sm">
          <CommunityDropdown 
            communities={communities} 
            groups={groups}
            selectedCommunityId={selectedCommunityId}
            setSelectedCommunityId={setSelectedCommunityId}
            selectedGroupId={selectedGroupId}
            setSelectedGroupId={setSelectedGroupId}
            isMobile={isMobile}
          />
          <HeaderActions isMobile={isMobile} />
        </div>
      )}
      
      <div className="flex items-center space-x-2 md:space-x-3">
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
    </header>
  );
}
