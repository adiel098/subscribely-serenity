
import {
  CreditCard,
  Settings,
  TrendingUp,
  Bot,
  BarChart,
  BadgeDollarSign,
  Wallet
} from 'lucide-react';
import { LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from './ui/button';

const menuItems = [
  {
    title: "Dashboard",
    icon: BarChart,
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
    path: "/settings"
  }
];

export function AppSidebar() {
  const { signOut } = useAuth();

  return (
    <Sidebar className="fixed left-4 top-20 h-[calc(100vh-6rem)] w-[250px] rounded-xl border-none shadow-lg bg-white/80 backdrop-blur-md">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="px-2 py-2">
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild>
                    <Link 
                      to={item.path}
                      className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-gray-100/50 transition-colors rounded-lg text-gray-700"
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Sign Out Button */}
        <div className="absolute bottom-4 left-0 right-0 px-4">
          <Button 
            variant="destructive" 
            className="w-full bg-red-500 hover:bg-red-600 text-white gap-2 transition-colors duration-200"
            onClick={signOut}
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
