
import { Bell, Moon, Sun, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

export function AdminNavbar() {
  const { theme, setTheme } = useTheme();
  const { signOut, user } = useAuth();
  
  // Get the first letter of the email for the avatar fallback
  const getInitials = () => {
    if (!user?.email) return 'U';
    return user.email.charAt(0).toUpperCase();
  };
  
  return (
    <header className="fixed top-0 left-0 right-0 h-16 border-b bg-white z-50 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <Link to="/" className="text-xl font-bold text-primary mr-6">
          Membify
        </Link>
        <h1 className="text-xl font-bold text-primary">
          Admin Panel
        </h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0">
            3
          </Badge>
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/placeholder.svg" alt="Profile" />
                <AvatarFallback>{getInitials()}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600" onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
