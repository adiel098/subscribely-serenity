
import {
  Users,
  CreditCard,
  MessagesSquare,
  Settings,
  TrendingUp,
  Bot,
  BarChart,
  Calendar,
  Gift,
  BadgeDollarSign
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const menuItems = [
  {
    title: "Dashboard",
    icon: BarChart,
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
    icon: Calendar,
    path: "/events"
  },
  {
    title: "Rewards",
    icon: Gift,
    path: "/rewards"
  },
  {
    title: "Settings",
    icon: Settings,
    path: "/settings"
  }
];

export function AppSidebar() {
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
      </SidebarContent>
    </Sidebar>
  );
}
