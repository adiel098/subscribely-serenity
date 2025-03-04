
import {
  BarChart,
  BadgeDollarSign,
  CreditCard,
  Wallet,
  TrendingUp,
  Bot,
  LogOut
} from 'lucide-react';
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
    <Sidebar className="fixed left-4 top-20 h-[calc(100vh-6rem)] w-[250px] rounded-xl border-none shadow-md bg-white">
      <SidebarContent>
        <div className="px-3 py-4">
          <div className="flex items-center gap-3 mb-6 p-2">
            <div className="bg-blue-500 text-white p-2 rounded-lg">
              <BarChart className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-800">Community Hub</h2>
              <p className="text-xs text-gray-500">Manage & Grow</p>
            </div>
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
                        className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors duration-200 ${
                          isActive 
                            ? 'bg-blue-50 text-blue-600 font-medium' 
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <item.icon className={`h-5 w-5 ${isActive ? 'text-blue-500' : 'text-gray-400'}`} />
                        <span>{item.title}</span>
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
          <Button 
            variant="outline" 
            className="w-full border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-gray-600 gap-2"
            onClick={signOut}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
