
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
    <Sidebar className="glass-card fixed left-4 top-20 h-[calc(100vh-6rem)] rounded-xl w-64 border-none">
      <SidebarContent>
        <SidebarGroup>
          <div className="flex items-center justify-between p-4">
            <SidebarGroupLabel className="text-lg font-semibold">
              Menu
            </SidebarGroupLabel>
            <Button variant="ghost" size="icon">
              <MenuIcon className="h-4 w-4" />
            </Button>
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton 
                    onClick={() => navigate(item.path)}
                    className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-white/50 transition-colors rounded-lg"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
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
