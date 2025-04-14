import { lazy } from "react";
import { RouteObject } from "react-router-dom";
import { ProtectedRoute } from "@/auth/guards/ProtectedRoute";
import { DashboardLayout } from "@/group_owners/components/DashboardLayout";

// Lazy loading group owner pages
const OwnerDashboard = lazy(() => import("@/group_owners/pages/Dashboard"));
const Subscribers = lazy(() => import("@/group_owners/pages/Subscribers"));
const Subscriptions = lazy(() => import("@/group_owners/pages/Subscriptions"));
const PaymentMethods = lazy(() => import("@/group_owners/pages/PaymentMethods"));
const BotSettings = lazy(() => import("@/group_owners/pages/BotSettings"));
const PlatformPlans = lazy(() => import("@/group_owners/pages/PlatformPlans"));
const PlatformPayment = lazy(() => import("@/group_owners/pages/PlatformPayment"));
const TelegramConnect = lazy(() => import("@/group_owners/pages/connect/TelegramConnect"));
const MembifySettings = lazy(() => import("@/group_owners/pages/MembifySettings"));
const TelegramBot = lazy(() => import("@/group_owners/pages/TelegramBot"));
const CommunityEdit = lazy(() => import("@/group_owners/pages/communities/CommunityEdit"));
const GroupEdit = lazy(() => import("@/group_owners/pages/groups/GroupEdit"));
const CouponsPage = lazy(() => import("@/group_owners/components/coupons/CouponsPage"));
const NewProject = lazy(() => import("@/group_owners/pages/projects/NewProject"));
const Onboarding = lazy(() => import("@/group_owners/pages/onboarding/Onboarding"));
const CustomBotNewCommunity = lazy(() => import("@/group_owners/pages/new-community/CustomBotNewCommunity"));
const Messages = lazy(() => import("@/group_owners/pages/Messages"));

// Helper HOC for protected dashboard routes
const withDashboardLayout = (Component: React.ComponentType) => {
  return (
    <DashboardLayout>
      <ProtectedRoute>
        <Component />
      </ProtectedRoute>
    </DashboardLayout>
  );
};

// Helper HOC for simple protected routes (without dashboard layout)
const withProtection = (Component: React.ComponentType) => {
  return (
    <ProtectedRoute>
      <Component />
    </ProtectedRoute>
  );
};

export const groupOwnerRoutes: RouteObject[] = [
  // Main dashboard routes
  {
    path: "/dashboard",
    element: withDashboardLayout(OwnerDashboard)
  },
  {
    path: "/subscribers",
    element: withDashboardLayout(Subscribers)
  },
  {
    path: "/subscriptions",
    element: withDashboardLayout(Subscriptions)
  },
  {
    path: "/coupons",
    element: withDashboardLayout(CouponsPage)
  },
  {
    path: "/payment-methods",
    element: withDashboardLayout(PaymentMethods)
  },
  {
    path: "/messages",
    element: withDashboardLayout(Messages)
  },
  {
    path: "/bot-settings",
    element: withDashboardLayout(BotSettings)
  },
  {
    path: "/telegram-bot",
    element: withDashboardLayout(TelegramBot)
  },
  {
    path: "/membify-settings",
    element: withDashboardLayout(MembifySettings)
  },
  
  // Routes without dashboard layout
  {
    path: "/platform-plans",
    element: withProtection(PlatformPlans)
  },
  {
    path: "/platform-payment",
    element: withProtection(PlatformPayment)
  },
  {
    path: "/connect/telegram",
    element: withProtection(TelegramConnect)
  },
  
  // Community and groups routes
  {
    path: "/communities/:communityId/edit",
    element: withDashboardLayout(CommunityEdit)
  },
  {
    path: "/groups/:groupId/edit",
    element: withDashboardLayout(GroupEdit)
  },
  
  // Project management
  {
    path: "/projects/new",
    element: withProtection(NewProject)
  },
  
  // New community
  {
    path: "/new-community/custom-bot",
    element: withProtection(CustomBotNewCommunity)
  },
  
  // Onboarding
  {
    path: "/onboarding",
    element: withProtection(Onboarding)
  },
  {
    path: "/onboarding/:step",
    element: withProtection(Onboarding)
  }
];
