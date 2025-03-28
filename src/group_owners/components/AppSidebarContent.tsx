
import { LayoutDashboard, BadgeDollarSign, CreditCard, Wallet, Bot, LogOut, HelpCircle, Settings, Megaphone, Tag } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/contexts/AuthContext';
import { 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton 
} from "@/components/ui/sidebar";
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard"
  },
  {
    title: "Subscribers",
    icon: BadgeDollarSign,
    path: "/subscribers"
  },
  {
    title: "Plans",
    icon: CreditCard,
    path: "/subscriptions"
  },
  {
    title: "Discount Coupons",
    icon: Tag,
    path: "/coupons"
  },
  {
    title: "Payment Methods",
    icon: Wallet,
    path: "/payment-methods"
  },
  {
    title: "Bot Settings",
    icon: Megaphone,
    path: "/bot-settings"
  },
  {
    title: "Telegram Bot",
    icon: Bot,
    path: "/telegram-bot"
  },
  {
    title: "Membify Settings",
    icon: Settings,
    path: "/membify-settings",
    highlight: true
  }
];

export function AppSidebarContent({ isMobile = false }) {
  const { signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleLogout = async () => {
    try {
      console.log('AppSidebar: Initiating logout process');
      
      // Clear browser storage before calling signOut
      sessionStorage.clear();
      localStorage.clear();
      
      // Call the signOut function
      await signOut();
      
      console.log("User logged out from AppSidebar");
      
      // Redirect to auth page
      navigate('/auth', { replace: true });
      
      toast({
        title: "Successfully signed out",
        description: "You have been signed out from your account."
      });
    } catch (error) {
      console.error('AppSidebar: Error during logout:', error);
      
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
    <SidebarContent className={`my-0 py-0 px-0 mx-0 ${isMobile ? 'pt-2' : 'my-[64px]'}`}>
      <SidebarGroup>
        <SidebarGroupContent className="px-2 py-2">
          <SidebarMenu>
            {menuItems.map(item => {
              const isActive = location.pathname === item.path;
              return (
                <SidebarMenuItem key={item.path}>
                  <motion.div 
                    whileHover={{
                      x: 4
                    }} 
                    transition={{
                      duration: 0.2
                    }} 
                    className="w-full"
                  >
                    <SidebarMenuButton asChild>
                      <Link 
                        to={item.path} 
                        className={`w-full flex items-center px-3 py-3 rounded-lg transition-all duration-200 ${
                          isActive 
                            ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 font-medium shadow-sm' 
                            : 'text-gray-600 hover:bg-blue-50'
                        }`}
                      >
                        <div className={`flex items-center justify-center ${isActive ? 'text-blue-600' : 'text-gray-500'} mr-3`}>
                          <item.icon className="h-5 w-5" />
                        </div>
                        {item.title === "Membify Settings" ? (
                          <span className="truncate bg-gradient-to-r from-purple-600 to-indigo-500 text-transparent bg-clip-text font-medium">
                            {item.title}
                          </span>
                        ) : (
                          <span className="truncate">{item.title}</span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </motion.div>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Sign Out Button */}
      <div className={`${isMobile ? 'relative mt-8 mb-4' : 'absolute bottom-6'} left-0 right-0 px-4 space-y-2`}>
        <Button variant="outline" className="w-full border-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 text-gray-600 gap-2" onClick={() => {}}>
          <HelpCircle className="h-4 w-4" />
          Help & Support
        </Button>
        <Button 
          variant="outline" 
          className="w-full border-red-100 bg-gradient-to-r from-red-50/70 to-rose-50/70 hover:from-red-100/90 hover:to-rose-100/90 text-red-600 hover:text-red-700 hover:border-red-200 gap-2" 
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </SidebarContent>
  );
}
