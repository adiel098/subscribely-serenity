
import { useState } from 'react';
import { useAuth } from '@/auth/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Logo } from './navbar/Logo';
import { DesktopMenu } from './navbar/DesktopMenu';
import { MobileMenuButton } from './navbar/MobileMenuButton';
import { MobileMenu } from './navbar/MobileMenu';

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
    <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Logo />
          <DesktopMenu handleSignOut={handleSignOut} />
          <MobileMenuButton isOpen={isOpen} toggleMenu={toggleMenu} />
        </div>
      </div>
      
      <MobileMenu 
        isOpen={isOpen} 
        setIsOpen={setIsOpen} 
        handleSignOut={handleSignOut}
      />
    </nav>
  );
};

export default Navbar;
