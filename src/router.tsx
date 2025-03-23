
import { createBrowserRouter } from "react-router-dom";
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

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppRoutes />,
    errorElement: <MainNotFound />,
    children: [
      {
        index: true,
        element: <Index />
      },
      // Group owner routes
      {
        path: "dashboard",
        element: <ProtectedRoute><Dashboard /></ProtectedRoute>
      },
      {
        path: "subscriptions",
        element: <ProtectedRoute><Subscriptions /></ProtectedRoute>
      },
      {
        path: "subscribers",
        element: <ProtectedRoute><Subscribers /></ProtectedRoute>
      },
      {
        path: "payment-methods",
        element: <ProtectedRoute><PaymentMethods /></ProtectedRoute>
      },
      {
        path: "bot-settings",
        element: <ProtectedRoute><BotSettings /></ProtectedRoute>
      },
      {
        path: "telegram-bot",
        element: <ProtectedRoute><TelegramBot /></ProtectedRoute>
      },
      {
        path: "membify-settings",
        element: <ProtectedRoute><MembifySettings /></ProtectedRoute>
      },
      {
        path: "platform-plans",
        element: <ProtectedRoute><PlatformPlans /></ProtectedRoute>
      },
      {
        path: "platform-payment",
        element: <ProtectedRoute><PlatformPayment /></ProtectedRoute>
      },
      {
        path: "onboarding",
        element: <ProtectedRoute><Onboarding /></ProtectedRoute>
      },
      {
        path: "connect/telegram",
        element: <ProtectedRoute><TelegramConnect /></ProtectedRoute>
      },
      // Admin routes
      {
        path: "admin/dashboard",
        element: <AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>
      },
      {
        path: "admin/communities",
        element: <AdminProtectedRoute><AdminCommunities /></AdminProtectedRoute>
      },
      {
        path: "admin/users",
        element: <AdminProtectedRoute><AdminUsers /></AdminProtectedRoute>
      },
      {
        path: "admin/payments",
        element: <AdminProtectedRoute><AdminPayments /></AdminProtectedRoute>
      },
      {
        path: "admin/reports",
        element: <AdminProtectedRoute><AdminReports /></AdminProtectedRoute>
      },
      {
        path: "admin/settings",
        element: <AdminProtectedRoute><AdminSettings /></AdminProtectedRoute>
      },
      // Authentication routes
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
      }
    ]
  }
]);
