
import { LayoutDashboard, BadgeDollarSign, CreditCard, Wallet, TrendingUp, Bot, LogOut, HelpCircle, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/auth/contexts/AuthContext';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

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
    title: "Subscriptions",
    icon: CreditCard,
    path: "/subscriptions"
  },
  {
    title: "Payment Methods",
    icon: Wallet,
    path: "/messages"
  },
  {
    title: "Analytics",
    icon: TrendingUp,
    path: "/analytics"
  },
  {
    title: "Bot Settings",
    icon: Bot,
    path: "/bot-settings"
  },
  {
    title: "Membify Settings",
    icon: Settings,
    path: "/membify-settings",
    highlight: true
  }
];

export function AppSidebar() {
  const { signOut } = useAuth();
  const location = useLocation();
  
  const handleLogout = async () => {
    try {
      console.log('AppSidebar: Initiating logout process');
      await signOut();
    } catch (error) {
      console.error('AppSidebar: Error during logout:', error);
    }
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="fixed left-2 top-[80px] h-[calc(100vh-88px)] z-30"
    >
      <Sidebar className="w-[220px] rounded-xl border border-blue-100 shadow-lg bg-white/95 backdrop-blur-md">
        <SidebarContent className="my-[64px] py-0 px-0 mx-0">
          <SidebarGroup>
            <SidebarGroupContent className="px-2 py-2">
              <SidebarMenu>
                {menuItems.map(item => {
                  const isActive = location.pathname === item.path;
                  return <SidebarMenuItem key={item.path}>
                    <motion.div whileHover={{
                      x: 4
                    }} transition={{
                      duration: 0.2
                    }} className="w-full">
                      <SidebarMenuButton asChild>
                        <Link 
                          to={item.path} 
                          className={`w-full flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 ${
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
                  </SidebarMenuItem>;
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Sign Out Button */}
          <div className="absolute bottom-6 left-0 right-0 px-4 space-y-2">
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
      </Sidebar>
    </motion.div>
  );
}
