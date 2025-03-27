import { useState } from "react";
import { useCommunityContext } from "@/contexts/CommunityContext";
import { 
  Home, 
  LayoutDashboard, 
  Settings as SettingsIcon,
  LogOut,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Users, 
  CreditCard, 
  Settings, 
  BarChart, 
  MessageSquare, 
  Tag
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useIsMobile } from "@/hooks/use-mobile";
import { Logo } from "../header/Logo";

interface SidebarItemProps {
  title: string;
  href: string;
  icon?: React.ReactNode;
  active?: boolean;
}

interface SidebarGroupProps {
  title: string;
  icon?: React.ReactNode;
  items: {
    title: string;
    href: string;
    icon?: React.ReactNode;
  }[];
}

const SidebarItem = ({ title, href, icon, active }: SidebarItemProps) => {
  const isMobile = useIsMobile();
  return (
    <Link
      to={href}
      className={`group flex items-center rounded-md px-2 py-1.5 text-sm font-medium hover:bg-secondary ${
        active ? "bg-secondary font-semibold" : "text-muted-foreground"
      }`}
    >
      {icon && <div className="mr-2 h-4 w-4">{icon}</div>}
      {title}
    </Link>
  );
};

export const sidebarLinks = [
  {
    title: "Dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    href: "/dashboard",
  },
  {
    title: "Subscribers",
    icon: <Users className="h-5 w-5" />,
    href: "/subscribers",
    items: [
      {
        title: "All Subscribers",
        href: "/subscribers",
      },
      {
        title: "Subscription Plans",
        href: "/subscriptions",
      },
      {
        title: "Discount Coupons",
        href: "/coupons",
        icon: <Tag className="h-4 w-4" />,
      },
    ],
  },
  {
    title: "Payments",
    icon: <CreditCard className="h-5 w-5" />,
    href: "/payments",
  },
  {
    title: "Messages",
    icon: <MessageSquare className="h-5 w-5" />,
    href: "/messages",
  },
  {
    title: "Settings",
    icon: <Settings className="h-5 w-5" />,
    href: "/settings",
  },
];

export function GroupOwnerSidebar() {
  const { user, signOut } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { selectedCommunity, selectCommunity, communities } = useCommunityContext();

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="flex h-full flex-col border-r bg-white shadow-sm">
      <div className="flex-1">
        <div className="flex px-4 py-3">
          <Logo />
        </div>
        <Separator />
        <ScrollArea className="flex-1 space-y-0.5 p-4">
          {sidebarLinks.map((link, index) => {
            if ((link as SidebarItemProps).href) {
              return (
                <SidebarItem
                  key={index}
                  title={link.title}
                  href={link.href}
                  icon={link.icon}
                  active={pathname === link.href}
                />
              );
            } else if ((link as SidebarGroupProps).items) {
              const group = link as SidebarGroupProps;
              return (
                <div key={index} className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {group.title}
                  </p>
                  <div className="space-y-1">
                    {group.items.map((item, itemIndex) => (
                      <SidebarItem
                        key={itemIndex}
                        title={item.title}
                        href={item.href}
                        icon={item.icon}
                        active={pathname === item.href}
                      />
                    ))}
                  </div>
                </div>
              );
            }
            return null;
          })}
        </ScrollArea>
      </div>
      <div className="border-t p-4">
        <div className="mb-4 flex items-center space-x-4 pt-4">
          <Avatar>
            <AvatarImage src={user?.avatar_url} />
            <AvatarFallback>{user?.email?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="space-y-0.5">
            <p className="text-sm font-medium">{user?.full_name}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            signOut();
            navigate("/");
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </Button>
      </div>
    </div>
  );
}
