
import { Bell, Moon, Sun, LogOut, User, Settings, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/auth/contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

export function AdminNavbar() {
  const { theme, setTheme } = useTheme();
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Get the first letter of the email for the avatar fallback
  const getInitials = () => {
    if (!user?.email) return 'U';
    return user.email.charAt(0).toUpperCase();
  };
  
  const handleSignOut = async () => {
    try {
      console.log("AdminNavbar: Initiating logout process");
      
      // Clear browser storage before calling signOut
      sessionStorage.clear();
      localStorage.clear();
      
      // Call the signOut function
      await signOut();
      
      console.log("User logged out from AdminNavbar");
      
      // Redirect to auth page
      navigate('/auth', { replace: true });
      
      toast({
        title: "Successfully signed out",
        description: "You have been signed out from the admin panel."
      });
    } catch (error) {
      console.error("Error signing out from AdminNavbar:", error);
      
      // Even if there's an error, make sure we clear the local storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Force redirect to auth page
      navigate('/auth', { replace: true });
      
      toast({
        title: "Sign out completed",
        description: "You have been signed out, although there were some issues in the process."
      });
    }
  };
  
  return (
    <header className="fixed top-0 left-0 right-0 h-16 border-b bg-white/90 backdrop-blur-md z-50 flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center gap-4">
        <Link to="/" className="text-xl font-bold text-primary flex items-center gap-2">
          <Crown className="h-5 w-5 text-indigo-500" /> 
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            Membify
          </span>
        </Link>
        <h1 className="text-xl font-bold ml-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-md">
          Admin Panel ✨
        </h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" className="relative hover:bg-indigo-50" aria-label="Notifications">
          <Bell className="h-5 w-5 text-indigo-700" />
          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-indigo-600">
            3
          </Badge>
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon"
          className="hover:bg-indigo-50"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5 text-indigo-700" /> : <Moon className="h-5 w-5 text-indigo-700" />}
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-indigo-50">
              <Avatar className="h-9 w-9 border-2 border-indigo-100">
                <AvatarImage src="/placeholder.svg" alt="Profile" />
                <AvatarFallback className="bg-indigo-100 text-indigo-700">{getInitials()}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 border-indigo-100">
            <DropdownMenuLabel className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-indigo-500" />
              <span>Admin Account</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex items-center cursor-pointer">
              <User className="mr-2 h-4 w-4 text-indigo-600" />
              <span>Profile Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center cursor-pointer">
              <Settings className="mr-2 h-4 w-4 text-indigo-600" />
              <span>Admin Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="flex items-center text-red-600 cursor-pointer hover:text-red-700 hover:bg-red-50" 
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
