
import {
  Users,
  CreditCard,
  MessagesSquare,
  Settings,
  TrendingUp,
  BadgeDollarSign,
  ChartBarIcon,
  Bot,
  CalendarDays,
  GiftIcon,
  MenuIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from '@/components/ui/button';

const menuItems = [
  {
    title: "Dashboard",
    icon: ChartBarIcon,
    path: "/dashboard"
  },
  {
    title: "Members",
    icon: Users,
    path: "/members"
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
    title: "Messages",
    icon: MessagesSquare,
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
    title: "Events",
    icon: CalendarDays,
    path: "/events"
  },
  {
    title: "Rewards",
    icon: GiftIcon,
    path: "/rewards"
  },
  {
    title: "Settings",
    icon: Settings,
    path: "/settings"
  }
];

export function AppSidebar() {
  const navigate = useNavigate();

  return (
    <Sidebar className="glass-card fixed left-4 top-4 bottom-4 h-[calc(100vh-2rem)] rounded-xl w-[250px] border-none shadow-lg bg-white/80 backdrop-blur-md">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="px-2 py-2">
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton 
                    onClick={() => navigate(item.path)}
                    className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-gray-100/50 transition-colors rounded-lg text-gray-700"
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
