
import { LayoutDashboard, LogOut, Shield, LogIn, UserPlus } from 'lucide-react';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/contexts/AuthContext';
import { useAdminPermission } from '@/auth/hooks/useAdminPermission';

interface DesktopMenuProps {
  handleSignOut: (e: React.MouseEvent) => Promise<void>;
}

export const DesktopMenu = ({ handleSignOut }: DesktopMenuProps) => {
  const { user } = useAuth();
  const { isAdmin } = useAdminPermission();
  const navigate = useNavigate();

  return (
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
          <Button 
            variant="outline" 
            onClick={() => navigate('/auth')}
            className="flex items-center gap-2"
          >
            <LogIn className="h-4 w-4" />
            Sign In
          </Button>
          <Button 
            onClick={() => navigate('/auth')}
            className="flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
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
  );
};
