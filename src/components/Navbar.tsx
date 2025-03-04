
import { useState } from 'react';
import { Menu, X, LayoutDashboard, LogOut, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useAdminPermission } from '@/admin/hooks/useAdminPermission';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdminPermission();
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

  return (
    <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <span className="text-xl font-semibold cursor-pointer" onClick={() => navigate('/')}>
              Membify
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {user && (
              <>
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center gap-2"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Button>
                
                {isAdmin && (
                  <Button 
                    variant="ghost" 
                    onClick={() => navigate('/admin/dashboard')}
                    className="flex items-center gap-2"
                  >
                    <Shield className="h-4 w-4" />
                    Admin Panel
                  </Button>
                )}
              </>
            )}
            <a href="#features" className="text-gray-700 hover:text-gray-900 transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-gray-700 hover:text-gray-900 transition-colors">
              Pricing
            </a>
            <a href="#contact" className="text-gray-700 hover:text-gray-900 transition-colors">
              Contact
            </a>
            {!user ? (
              <>
                <Button variant="outline" onClick={() => navigate('/auth')}>
                  Sign In
                </Button>
                <Button onClick={() => navigate('/auth')}>
                  Sign Up
                </Button>
              </>
            ) : (
              <Button 
                variant="outline" 
                onClick={handleSignOut}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-gray-700 hover:text-gray-900 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-b border-gray-200">
            {user && (
              <>
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    navigate('/dashboard');
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-2 justify-start"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Button>
                
                {isAdmin && (
                  <Button 
                    variant="ghost" 
                    onClick={() => {
                      navigate('/admin/dashboard');
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center gap-2 justify-start"
                  >
                    <Shield className="h-4 w-4" />
                    Admin Panel
                  </Button>
                )}
              </>
            )}
            <a
              href="#features"
              className="block px-3 py-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="block px-3 py-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            >
              Pricing
            </a>
            <a
              href="#contact"
              className="block px-3 py-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            >
              Contact
            </a>
            <div className="pt-4 pb-3 border-t border-gray-200">
              {!user ? (
                <>
                  <Button variant="outline" onClick={() => {
                    navigate('/auth');
                    setIsOpen(false);
                  }} className="w-full mb-2">
                    Sign In
                  </Button>
                  <Button onClick={() => {
                    navigate('/auth');
                    setIsOpen(false);
                  }} className="w-full">
                    Sign Up
                  </Button>
                </>
              ) : (
                <Button 
                  variant="outline" 
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 justify-center"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
