
import { Users, Settings, Shield, Inbox, Bot, CreditCard, BarChart2, UserPlus } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/features/community/components/ui/sidebar";
import { ScrollArea } from "@/features/community/components/ui/scroll-area";

export const AppSidebar = () => {
  const location = useLocation();
  const { user } = useAuth();

  const { data: isAdmin } = useQuery({
    queryKey: ['is-admin', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      const { data } = await supabase
        .from('admin_users')
        .select('role')
        .eq('user_id', user.id)
        .single();
      return !!data;
    },
    enabled: !!user?.id
  });

  return (
    <SidebarProvider defaultOpen>
      <Sidebar className="fixed top-16 bottom-0 z-30 border-r border-r-slate-200">
        <SidebarRail />
        <SidebarHeader>
          <SidebarTrigger />
        </SidebarHeader>
        <SidebarContent>
          <ScrollArea className="h-[calc(100vh-10rem)]">
            <div className="space-y-1 px-2">
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `flex items-center rounded-lg px-3 py-2 text-slate-900 transition-all hover:bg-slate-100 ${
                    isActive ? 'bg-slate-100' : ''
                  }`
                }
              >
                <BarChart2 className="mr-2 h-4 w-4" />
                Dashboard
              </NavLink>
              <NavLink
                to="/subscribers"
                className={({ isActive }) =>
                  `flex items-center rounded-lg px-3 py-2 text-slate-900 transition-all hover:bg-slate-100 ${
                    isActive ? 'bg-slate-100' : ''
                  }`
                }
              >
                <Users className="mr-2 h-4 w-4" />
                Subscribers
              </NavLink>
              <NavLink
                to="/messages"
                className={({ isActive }) =>
                  `flex items-center rounded-lg px-3 py-2 text-slate-900 transition-all hover:bg-slate-100 ${
                    isActive ? 'bg-slate-100' : ''
                  }`
                }
              >
                <Inbox className="mr-2 h-4 w-4" />
                Messages
              </NavLink>
              <NavLink
                to="/bot-settings"
                className={({ isActive }) =>
                  `flex items-center rounded-lg px-3 py-2 text-slate-900 transition-all hover:bg-slate-100 ${
                    isActive ? 'bg-slate-100' : ''
                  }`
                }
              >
                <Bot className="mr-2 h-4 w-4" />
                Bot Settings
              </NavLink>
              <NavLink
                to="/subscriptions"
                className={({ isActive }) =>
                  `flex items-center rounded-lg px-3 py-2 text-slate-900 transition-all hover:bg-slate-100 ${
                    isActive ? 'bg-slate-100' : ''
                  }`
                }
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Subscriptions
              </NavLink>
              <NavLink
                to="/customers"
                className={({ isActive }) =>
                  `flex items-center rounded-lg px-3 py-2 text-slate-900 transition-all hover:bg-slate-100 ${
                    isActive ? 'bg-slate-100' : ''
                  }`
                }
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Customers
              </NavLink>
              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  `flex items-center rounded-lg px-3 py-2 text-slate-900 transition-all hover:bg-slate-100 ${
                    isActive ? 'bg-slate-100' : ''
                  }`
                }
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </NavLink>
              {isAdmin && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    `flex items-center rounded-lg px-3 py-2 text-slate-900 transition-all hover:bg-slate-100 ${
                      isActive ? 'bg-slate-100' : ''
                    }`
                  }
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Admin
                </NavLink>
              )}
            </div>
          </ScrollArea>
        </SidebarContent>
        <SidebarFooter />
      </Sidebar>
    </SidebarProvider>
  );
};
