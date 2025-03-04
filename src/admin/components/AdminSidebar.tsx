
import { 
  LayoutDashboard, 
  Users, 
  Globe, 
  CreditCard, 
  Settings, 
  BarChart, 
  LogOut 
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
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
import { useAuth } from '@/auth/contexts/AuthContext';

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/admin/dashboard"
  },
  {
    title: "Communities",
    icon: Globe,
    path: "/admin/communities"
  },
  {
    title: "Users",
    icon: Users,
    path: "/admin/users"
  },
  {
    title: "Payments",
    icon: CreditCard,
    path: "/admin/payments"
  },
  {
    title: "Reports",
    icon: BarChart,
    path: "/admin/reports"
  },
  {
    title: "Settings",
    icon: Settings,
    path: "/admin/settings"
  }
];

export function AdminSidebar() {
  const { signOut } = useAuth();
  const location = useLocation();

  return (
    <Sidebar className="fixed right-4 top-20 h-[calc(100vh-6rem)] w-[250px] rounded-xl border-none shadow-lg bg-white/80 backdrop-blur-md">
      <SidebarContent>
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
                        className={`w-full flex items-center space-x-3 px-3 py-2 transition-colors rounded-lg text-gray-700 ${
                          isActive ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100/50'
                        }`}
                      >
                        <item.icon className="h-5 w-5 ml-3" />
                        <span className="font-medium">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
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
            <LogOut className="h-5 w-5 ml-2" />
            Sign Out
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
