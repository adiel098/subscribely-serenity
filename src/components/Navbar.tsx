
import { useState } from 'react';
import { useAuth } from '@/auth/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Logo } from './navbar/Logo';
import { DesktopMenu } from './navbar/DesktopMenu';
import { MobileMenuButton } from './navbar/MobileMenuButton';
import { MobileMenu } from './navbar/MobileMenu';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    console.log("🚪 Navbar: Sign out button clicked");
    
    // Close mobile menu if open
    if (isOpen) {
      setIsOpen(false);
    }
    
    await signOut();
  };

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed w-full z-50 bg-gradient-to-r from-indigo-500/90 via-purple-500/90 to-pink-500/90 backdrop-blur-md border-b border-white/20 shadow-lg"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Logo />
          <div className="flex items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="hidden md:flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-full text-white"
            >
              <Sparkles className="h-4 w-4 text-yellow-300" />
              <span className="text-sm font-medium">Membify Premium</span>
            </motion.div>
            <DesktopMenu handleSignOut={handleSignOut} />
          </div>
          <MobileMenuButton isOpen={isOpen} toggleMenu={toggleMenu} />
        </div>
      </div>
      
      <MobileMenu 
        isOpen={isOpen} 
        setIsOpen={setIsOpen} 
        handleSignOut={handleSignOut}
      />
    </motion.nav>
  );
};

export default Navbar;
