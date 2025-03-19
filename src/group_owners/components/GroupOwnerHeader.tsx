import { useState } from 'react';
import { useAuth } from '@/auth/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Bell, Crown, User, Settings, LogOut, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
export function GroupOwnerHeader() {
  const {
    signOut,
    user
  } = useAuth();
  const navigate = useNavigate();
  const [showHelp, setShowHelp] = useState(false);
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
  return <header className="fixed top-0 left-0 right-0 h-[68px] z-50 bg-white/95 shadow-sm backdrop-blur-sm flex items-center justify-between px-6">
      <motion.div initial={{
      opacity: 0,
      x: -20
    }} animate={{
      opacity: 1,
      x: 0
    }} transition={{
      duration: 0.4,
      ease: "easeOut"
    }} className="flex items-center gap-3">
        <Link to="/dashboard" className="text-xl font-bold flex items-center gap-2">
          <Crown className="h-6 w-6 text-amber-500 drop-shadow-sm" /> 
          <span className="font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-500 bg-clip-text text-transparent">
            Membify
          </span>
        </Link>
      </motion.div>
      
      <div className="flex items-center space-x-3">
        <motion.div whileHover={{
        scale: 1.05
      }} whileTap={{
        scale: 0.95
      }}>
          
        </motion.div>
        
        <motion.div whileHover={{
        scale: 1.05
      }} whileTap={{
        scale: 0.95
      }}>
          
        </motion.div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.div whileHover={{
            scale: 1.05
          }} whileTap={{
            scale: 0.95
          }}>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-indigo-200/50 border-2 border-indigo-300">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg" alt="Profile" />
                  <AvatarFallback className="bg-gradient-to-br from-blue-400 to-indigo-600 text-white font-bold">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </motion.div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 border-blue-100 shadow-xl">
            <DropdownMenuLabel className="flex items-center gap-2 pb-2">
              <Crown className="h-4 w-4 text-yellow-500" />
              <span className="text-blue-700 font-medium">Community Manager</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex items-center cursor-pointer py-2">
              <User className="mr-2 h-4 w-4 text-blue-600" />
              <span>My Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center cursor-pointer py-2">
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
      
      {showHelp && <motion.div initial={{
      opacity: 0,
      y: 10
    }} animate={{
      opacity: 1,
      y: 0
    }} exit={{
      opacity: 0,
      y: 10
    }} className="absolute top-16 right-6 bg-white rounded-lg shadow-xl p-4 w-72 border border-blue-100 z-50">
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
        </motion.div>}
    </header>;
}