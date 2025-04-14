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
const NewProject = lazy(() => import("@/group_owners/pages/projects/NewProject"));
const Onboarding = lazy(() => import("@/group_owners/pages/onboarding/Onboarding"));
const CouponsPage = lazy(() => import("@/group_owners/components/coupons/CouponsPage"));
const TelegramBot = lazy(() => import("@/group_owners/pages/TelegramBot"));

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
    path: "/bot-settings",
    element: withDashboardLayout(BotSettings)
  },
  {
    path: "/telegram-bot",
    element: withDashboardLayout(TelegramBot)
  },
  // Project management
  {
    path: "/projects/new",
    element: withProtection(NewProject)
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
