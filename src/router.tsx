
import { createBrowserRouter, RouteObject } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import Login from "./auth/pages/Login";
import SignUp from "./auth/pages/SignUp";
import Auth from "./auth/pages/Auth";
import ForgotPassword from "./auth/pages/ForgotPassword";
import ResetPassword from "./auth/pages/ResetPassword";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./auth/guards/ProtectedRoute";
import Dashboard from "./group_owners/pages/Dashboard";
import Subscriptions from "./group_owners/pages/Subscriptions";
import Subscribers from "./group_owners/pages/Subscribers";
import PaymentMethods from "./group_owners/pages/PaymentMethods";
import BotSettings from "./group_owners/pages/BotSettings";
import TelegramBot from "./group_owners/pages/TelegramBot";
import MembifySettings from "./group_owners/pages/MembifySettings";
import PlatformPlans from "./group_owners/pages/PlatformPlans";
import PlatformPayment from "./group_owners/pages/PlatformPayment";
import Onboarding from "./group_owners/pages/onboarding/Onboarding";
import Index from "./main/pages/Index";
import MainNotFound from "./main/pages/NotFound";
import { AdminProtectedRoute } from "./auth/guards/AdminProtectedRoute";
import AdminDashboard from "./admin/pages/Dashboard";
import AdminCommunities from "./admin/pages/Communities";
import AdminUsers from "./admin/pages/Users";
import AdminPayments from "./admin/pages/Payments";
import AdminReports from "./admin/pages/Reports";
import AdminSettings from "./admin/pages/Settings";
import TelegramConnect from "./group_owners/pages/connect/TelegramConnect";
import CustomBotNewCommunity from "@/group_owners/pages/new-community/CustomBotNewCommunity";
import { CouponsPage } from "@/group_owners/components/coupons/CouponsPage";
import { AppProviders } from "./providers/AppProviders";
import { createElement } from "react";

// Define routes without wrapping everything with providers
const routes: RouteObject[] = [
  {
    path: "/",
    element: <AppRoutes />,
    errorElement: <MainNotFound />,
    children: [
      {
        index: true,
        element: <Index />
      },
      {
        path: "dashboard",
        element: <ProtectedRoute />,
        children: [{ index: true, element: <Dashboard /> }]
      },
      {
        path: "subscriptions",
        element: <ProtectedRoute />,
        children: [{ index: true, element: <Subscriptions /> }]
      },
      {
        path: "subscribers",
        element: <ProtectedRoute />,
        children: [{ index: true, element: <Subscribers /> }]
      },
      {
        path: "coupons",
        element: <ProtectedRoute />,
        children: [{ index: true, element: <CouponsPage /> }]
      },
      {
        path: "payment-methods",
        element: <ProtectedRoute />,
        children: [{ index: true, element: <PaymentMethods /> }]
      },
      {
        path: "bot-settings",
        element: <ProtectedRoute />,
        children: [{ index: true, element: <BotSettings /> }]
      },
      {
        path: "telegram-bot",
        element: <ProtectedRoute />,
        children: [{ index: true, element: <TelegramBot /> }]
      },
      {
        path: "membify-settings",
        element: <ProtectedRoute />,
        children: [{ index: true, element: <MembifySettings /> }]
      },
      {
        path: "platform-plans",
        element: <ProtectedRoute />,
        children: [{ index: true, element: <PlatformPlans /> }]
      },
      {
        path: "platform-payment",
        element: <ProtectedRoute />,
        children: [{ index: true, element: <PlatformPayment /> }]
      },
      {
        path: "onboarding",
        element: <ProtectedRoute />,
        children: [{ index: true, element: <Onboarding /> }]
      },
      {
        path: "onboarding/:step",
        element: <ProtectedRoute />,
        children: [{ index: true, element: <Onboarding /> }]
      },
      {
        path: "connect/telegram",
        element: <ProtectedRoute />,
        children: [{ index: true, element: <TelegramConnect /> }]
      },
      {
        path: "admin/dashboard",
        element: <AdminProtectedRoute />,
        children: [{ index: true, element: <AdminDashboard /> }]
      },
      {
        path: "admin/communities",
        element: <AdminProtectedRoute />,
        children: [{ index: true, element: <AdminCommunities /> }]
      },
      {
        path: "admin/users",
        element: <AdminProtectedRoute />,
        children: [{ index: true, element: <AdminUsers /> }]
      },
      {
        path: "admin/payments",
        element: <AdminProtectedRoute />,
        children: [{ index: true, element: <AdminPayments /> }]
      },
      {
        path: "admin/reports",
        element: <AdminProtectedRoute />,
        children: [{ index: true, element: <AdminReports /> }]
      },
      {
        path: "admin/settings",
        element: <AdminProtectedRoute />,
        children: [{ index: true, element: <AdminSettings /> }]
      },
      {
        path: "auth",
        element: <Auth />
      },
      {
        path: "login",
        element: <Login />
      },
      {
        path: "signup",
        element: <SignUp />
      },
      {
        path: "forgot-password",
        element: <ForgotPassword />
      },
      {
        path: "reset-password",
        element: <ResetPassword />
      },
      {
        path: "*",
        element: <NotFound />
      },
      {
        path: "new-community/custom-bot",
        element: <ProtectedRoute />,
        children: [{ index: true, element: <CustomBotNewCommunity /> }]
      },
    ]
  }
];

// Helper function to wrap routes with providers
const wrapWithProviders = (routes: RouteObject[]): RouteObject[] => {
  return routes.map(route => ({
    ...route,
    element: route.element ? createElement(AppProviders, { children: route.element }) : route.element,
    errorElement: route.errorElement ? createElement(AppProviders, { children: route.errorElement }) : route.errorElement,
    children: route.children ? wrapWithProviders(route.children) : undefined,
  }));
};

// Create the router with providers
export const router = createBrowserRouter(wrapWithProviders(routes));
