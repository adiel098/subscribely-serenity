
import { useState } from 'react';
import { X, LayoutDashboard, LogOut, Shield, LogIn, UserPlus } from 'lucide-react';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/contexts/AuthContext';
import { useAdminPermission } from '@/auth/hooks/useAdminPermission';

interface MobileMenuProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  handleSignOut: (e: React.MouseEvent) => Promise<void>;
}

export const MobileMenu = ({ isOpen, setIsOpen, handleSignOut }: MobileMenuProps) => {
  const { user } = useAuth();
  const { isAdmin } = useAdminPermission();
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
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
              <Button 
                variant="outline" 
                onClick={() => {
                  navigate('/auth');
                  setIsOpen(false);
                }} 
                className="w-full mb-2 flex items-center gap-2 justify-center"
              >
                <LogIn className="h-4 w-4" />
                Sign In
              </Button>
              <Button 
                onClick={() => {
                  navigate('/auth');
                  setIsOpen(false);
                }} 
                className="w-full flex items-center gap-2 justify-center"
              >
                <UserPlus className="h-4 w-4" />
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
  );
};
