
import {
  CreditCard,
  Settings,
  TrendingUp,
  Bot,
  BarChart,
  BadgeDollarSign,
  Wallet,
  Sparkles
} from 'lucide-react';
import { LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/auth/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const menuItems = [
  {
    title: "Dashboard",
    icon: BarChart,
    path: "/dashboard",
    emoji: "📊"
  },
  {
    title: "Subscribers",
    icon: BadgeDollarSign,
    path: "/subscribers",
    emoji: "👥"
  },
  {
    title: "Subscriptions",
    icon: CreditCard,
    path: "/subscriptions",
    emoji: "💳"
  },
  {
    title: "Payment Methods",
    icon: Wallet,
    path: "/messages",
    emoji: "💰"
  },
  {
    title: "Analytics",
    icon: TrendingUp,
    path: "/analytics",
    emoji: "📈"
  },
  {
    title: "Bot Settings",
    icon: Bot,
    path: "/bot-settings",
    emoji: "🤖"
  }
];

export function AppSidebar() {
  const { signOut } = useAuth();
  const location = useLocation();

  return (
    <Sidebar className="fixed left-4 top-20 h-[calc(100vh-6rem)] w-[250px] rounded-xl border-none shadow-lg bg-gradient-to-b from-white via-white to-gray-50 backdrop-blur-md">
      <SidebarContent>
        <div className="px-4 py-6">
          <div className="flex items-center justify-center mb-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-3 rounded-lg"
            >
              <Sparkles className="h-6 w-6" />
            </motion.div>
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="ml-3"
            >
              <h2 className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Community Hub</h2>
              <p className="text-xs text-gray-500">Manage & Grow</p>
            </motion.div>
          </div>
        </div>
        <SidebarGroup>
          <SidebarGroupContent className="px-2 py-2">
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton asChild>
                      <Link 
                        to={item.path}
                        className={`w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-100/50 transition-all duration-300 rounded-lg ${
                          isActive 
                            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 text-blue-700 font-medium' 
                            : 'text-gray-700'
                        }`}
                      >
                        <div className={`flex items-center justify-center h-9 w-9 rounded-lg ${
                          isActive 
                            ? 'bg-blue-100 text-blue-600' 
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          <item.icon className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium">{item.title}</span>
                          <span className="text-xs text-gray-500">{item.emoji}</span>
                        </div>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Sign Out Button */}
        <div className="absolute bottom-6 left-0 right-0 px-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              variant="destructive" 
              className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white gap-2 transition-all duration-300 shadow-md hover:shadow-lg"
              onClick={signOut}
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </Button>
          </motion.div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
