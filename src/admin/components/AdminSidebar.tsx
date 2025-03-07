
import { 
  LayoutDashboard, 
  Users, 
  Globe, 
  CreditCard, 
  Settings, 
  BarChart, 
  LogOut,
  Sparkles, 
  Shield
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
    <Sidebar className="fixed left-4 top-20 h-[calc(100vh-6rem)] w-[250px] rounded-xl border border-indigo-100 shadow-lg bg-white/90 backdrop-blur-md">
      <SidebarContent className="p-0">
        <div className="flex justify-center my-4">
          <div className="bg-indigo-50 px-4 py-2 rounded-lg flex items-center gap-2">
            <Shield className="h-4 w-4 text-indigo-700" />
            <span className="text-sm font-medium text-indigo-700">Admin Portal</span>
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
                        className={`w-full flex items-center px-3 py-3 my-1 transition-all rounded-lg ${
                          isActive 
                            ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
                            : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <item.icon className={`h-5 w-5 mr-3 ${isActive ? 'text-indigo-600' : 'text-gray-500'}`} />
                        <span className="font-medium">{item.title}</span>
                        {isActive && <Sparkles className="h-3 w-3 ml-auto text-indigo-500" />}
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
            variant="destructive" 
            className="w-full bg-red-500 hover:bg-red-600 text-white gap-2 transition-colors duration-200 shadow-sm"
            onClick={signOut}
          >
            <LogOut className="h-5 w-5 mr-2" />
            Sign Out
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
