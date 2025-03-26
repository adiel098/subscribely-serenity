import { motion } from 'framer-motion';
import { Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface ProfileMenuProps {
  getInitials: () => string;
  navigateToAccountSettings: () => void;
  handleSignOut: () => void;
  isMobile?: boolean;
}

export function ProfileMenu({ getInitials, navigateToAccountSettings, handleSignOut, isMobile = false }: ProfileMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button 
            variant="ghost" 
            size={isMobile ? "icon" : "default"}
            className={`
              relative overflow-hidden group
              ${isMobile ? 'h-8 w-8' : 'h-10 w-10'} 
              rounded-full
              bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700
              border-none shadow-md hover:shadow-lg
              transition-all duration-300 ease-in-out
            `}
          >
            <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-colors duration-300" />
            <Avatar className={`h-${isMobile ? '6' : '8'} w-${isMobile ? '6' : '8'}`}>
              <AvatarImage alt="Profile" src="/lovable-uploads/fe0652ed-b292-4987-b51f-3706d2bdd013.png" />
              <AvatarFallback className="bg-gradient-to-br from-blue-400 to-indigo-600 text-white text-xs font-bold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
          </Button>
        </motion.div>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className={`
          w-32
          bg-white/95 backdrop-blur-sm 
          border border-indigo-100 
          shadow-lg rounded-lg p-1
        `}
      >
        <DropdownMenuItem 
          onClick={navigateToAccountSettings}
          className="flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-md cursor-pointer transition-colors duration-200"
        >
          <Settings className="h-4 w-4" />
          <span>Account Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={handleSignOut}
          className="flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-md cursor-pointer transition-colors duration-200"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
